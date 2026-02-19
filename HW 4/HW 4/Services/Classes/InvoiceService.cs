using AutoMapper;
using HW_4.DB_s;
using HW_4.DTO_s;
using HW_4.Models;
using HW_4.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HW_4.Services.Classes;

public class InvoiceService : IInvoiceService
{
    private readonly InvoiceManagerDB invoiceManagerDB;
    private readonly IMapper mapper;

    public InvoiceService(InvoiceManagerDB _invoiceManagerDB, IMapper _mapper)
    {
        invoiceManagerDB = _invoiceManagerDB;
        mapper = _mapper;
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
}
