using AutoMapper;
using HW_7.Common;
using HW_7.DB_s;
using HW_7.DTO_s;
using HW_7.Models;
using HW_7.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace HW_7.Services.Classes;

public class InvoiceService : IInvoiceService
{
    private readonly InvoiceManagerDB invoiceManagerDB;
    private readonly IExportService exportService;
    private readonly IMapper mapper;

    public InvoiceService(InvoiceManagerDB _invoiceManagerDB, IMapper _mapper,IExportService _exportService)
    {
        invoiceManagerDB = _invoiceManagerDB;
        mapper = _mapper;
        exportService = _exportService;
    }

    public async Task<InvoiceResponseDTO> CreateInvoiceAsync(CreateInvoiceRequestDTO invoice)
    {
        
        var invoiceToCreate = mapper.Map<Invoice>(invoice);
        await invoiceManagerDB.Invoices.AddAsync(invoiceToCreate);
        await invoiceManagerDB.SaveChangesAsync();
        return  mapper.Map<InvoiceResponseDTO>(invoiceToCreate);
    }

    public async Task<IEnumerable<InvoiceResponseDTO>> GetAllInvoicesAsync()
    {
        var allInvoice = mapper.Map<IEnumerable<InvoiceResponseDTO>>(await invoiceManagerDB.Invoices
            .Where(i => !i.IsArchived)
            .ToListAsync());

        return (!allInvoice.Any() ? throw new Exception("No invoices found ") : allInvoice );
    }

    public async Task<InvoiceResponseDTO> GetInvoiceByIdAsync(int id)
    {
        return mapper.Map<InvoiceResponseDTO>(await invoiceManagerDB.Invoices.
            Where(i => !i.IsArchived).
            FirstOrDefaultAsync(c => c.Id == id) ?? throw new Exception($"Invoice with id {id} not found."));
    }

    public async Task<InvoiceResponseDTO> UpdateInvoiceAsync(int id, UpdateInvoiceRequestDTO invoice)
    {
        var invoiceToUpdate = await invoiceManagerDB.Invoices.AnyAsync(i => i.Id == id) ?
            await invoiceManagerDB.Invoices.FirstOrDefaultAsync(i => i.Id == id) :
            throw new Exception($"Invoice with id {id} not found ");
        
        if (invoiceToUpdate.Status != 0) 
            throw new Exception("Only invoices with 'Created' status can be updated");

        mapper.Map(invoice, invoiceToUpdate);
        invoiceManagerDB.Invoices.Update(invoiceToUpdate);
        await invoiceManagerDB.SaveChangesAsync();
        return mapper.Map<InvoiceResponseDTO>(invoiceToUpdate);
    }

    public async Task<InvoiceResponseDTO> UpdateInvoiceStatusAsync(int id, InvoiceStatus newStatus)
    {
        var invoiceToUpdate = await invoiceManagerDB.Invoices.Where(i => !i.IsArchived).AnyAsync(i => i.Id == id) ?
            await invoiceManagerDB.Invoices.FirstOrDefaultAsync(i => i.Id == id) :
            throw new Exception($"Invoice with id {id} not found ");

        await invoiceManagerDB.Invoices.Where(i => i.Id == id)
            .ExecuteUpdateAsync(s => s
            .SetProperty(i => i.Status, newStatus));
        
        await invoiceManagerDB.SaveChangesAsync();

        return mapper.Map<InvoiceResponseDTO>(await invoiceManagerDB.Invoices.FirstOrDefaultAsync(i => i.Id == id));
    }

    public async Task<bool> DeleteInvoiceAsync(int id)
    {
        var invoiceToDelete = await invoiceManagerDB.Invoices.AnyAsync(i => i.Id == id) ?
            await invoiceManagerDB.Invoices.FirstOrDefaultAsync(i => i.Id == id) :
            throw new Exception($"Invoice with id {id} not found ");
       
        if (invoiceToDelete.Status != InvoiceStatus.Created) 
            throw new Exception("Invoice cannot be deleted because it's status is not 'Created'.");
        
        invoiceManagerDB.Invoices.Remove(invoiceToDelete);
        await invoiceManagerDB.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ArchiveInvoiceAsync(int id)
    {

        var invoiceToArchive = await invoiceManagerDB.Invoices.AnyAsync(i => i.Id == id) ?
            await invoiceManagerDB.Invoices.FirstOrDefaultAsync(i => i.Id == id) : 
            throw new Exception($"Invoice with id {id} not found ");
        
        invoiceToArchive.IsArchived = true;
        invoiceManagerDB.Invoices.Update(invoiceToArchive);
        await invoiceManagerDB.SaveChangesAsync();

        return true;
    }

    public async Task<Pages<InvoiceResponseDTO>> GetPagesAsync(InvoiceQueryParams queryParams)
    {
        queryParams.Validate();

        var invoicesQuery = invoiceManagerDB.Invoices
            .Where(c => !c.IsArchived)
            .Include(c => c.Customer)
            .AsQueryable();


        if (queryParams.CustomerId.HasValue)
            invoicesQuery = invoicesQuery.Where(t => t.CustomerId == queryParams.CustomerId);


        if (!string.IsNullOrWhiteSpace(queryParams.Status))
        {
            if (Enum.TryParse<InvoiceStatus>(queryParams.Status, out var status))
            {
                invoicesQuery = invoicesQuery.Where(t => t.Status == status);
            }
        }

       

        if (!string.IsNullOrWhiteSpace(queryParams.Search))
        {
            var searchTerm = queryParams.Search.ToLower();

            invoicesQuery = invoicesQuery.Where(t => t.Comment.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(queryParams.Sort))
            invoicesQuery = ApplySorting(invoicesQuery, queryParams.Sort, queryParams.SortDirection!);
        else
            invoicesQuery = invoicesQuery.OrderByDescending(t => t.CreatedAt);


        var totalCount = await invoiceManagerDB.Customers.CountAsync();

        var skip = (queryParams.Page - 1) * queryParams.PageSize;

        var tasks = await invoicesQuery
                            .Skip(skip)
                            .Take(queryParams.PageSize)
                            .ToListAsync();


        var taskDtos = mapper.Map<IEnumerable<InvoiceResponseDTO>>(tasks);

        return Pages<InvoiceResponseDTO>.Create(
            taskDtos,
            queryParams.Page,
            queryParams.PageSize,
            totalCount
            );


    }


    private IQueryable<Invoice> ApplySorting(
                                        IQueryable<Invoice> query,
                                        string sort,
                                        string sortDirection)
    {
        var isDescending = sortDirection?.ToLower() == "desc";

        return sort.ToLower() switch
        {
            
            "createdat" => isDescending
                            ? query.OrderByDescending(t => t.CreatedAt)
                            : query.OrderBy(t => t.CreatedAt),

            "status" => isDescending
                            ? query.OrderByDescending(t => t.Status)
                            : query.OrderBy(t => t.Status),

            _ => query.OrderByDescending(t => t.CreatedAt)
        };
    }

    public async Task<MemoryStream> DownloadInvoiceAsync(int id)
    {
        var invoice = await invoiceManagerDB.Invoices
        .Where(i => !i.IsArchived)
        .Include(i => i.Customer)
        .Include(i => i.InvoiceRows)
        .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
            throw new Exception($"Invoice with id {id} not found.");
        return await exportService.ExportInvoiceAsync(invoice);
    }
}
