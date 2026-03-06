using Application.Interfaces;
using Domain;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly InvoiceManagerDB _invoiceManagerDB;

    public InvoiceRepository(InvoiceManagerDB invoiceManagerDB)
    {
        _invoiceManagerDB = invoiceManagerDB;
    }


    public async Task<Invoice> AddAsync(Invoice invoice)
    {
        await _invoiceManagerDB.Invoices.AddAsync(invoice);
        await _invoiceManagerDB.SaveChangesAsync();

        return invoice;
    }

    public async Task<Invoice> ArchiveAsync(Invoice invoice)
    {
        if (invoice.IsArchived) throw new OperationCanceledException("Invoice already archived");

        invoice.IsArchived = true;

        _invoiceManagerDB.Invoices.Update(invoice);
        return invoice;
    }

    public async Task DeleteAsync(Invoice invoice)
    {
        _invoiceManagerDB.Invoices.Remove(invoice);

        await _invoiceManagerDB.SaveChangesAsync();
    }

    public async Task<IEnumerable<Invoice>> GetAllAsync()
    {
        return await _invoiceManagerDB.Invoices.Where(i => !i.IsArchived).ToListAsync();
    }

    public async Task<Invoice> GetByIdAsync(int Id)
    {
        return await _invoiceManagerDB.Invoices.Where(i => !i.IsArchived).Include(c => c.Customer).FirstOrDefaultAsync(i => i.Id == Id);
    }

    public async Task<(IEnumerable<Invoice> invoices, int TotalCount)> GetPagedAsync(int? customertId, string? status, string? search, string? sort, string? sortDirection, int page, int size)
    {
        var query = _invoiceManagerDB.Invoices.Include(t => t.Customer).AsQueryable();

        if (customertId.HasValue) query = query.Where(t => t.CustomerId == customertId.Value).Where(t => !t.IsArchived);
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<Domain.InvoiceStatus>(status, out var sv))
            query = query.Where(t => t.Status == sv);
       
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(t => t.Comment.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync();
        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        query = (sort?.ToLower()) switch
        {
            "comment" => isDesc ? query.OrderByDescending(t => t.Comment) : query.OrderBy(t => t.Comment),
            "createdat" => isDesc ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
            "status" => isDesc ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            _ => query.OrderByDescending(t => t.CreatedAt)
        };

        var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();
        return (items, totalCount);
    }

    public async Task UpdateAsync(Invoice invoice)
    {
        if (!invoice.IsArchived) throw new OperationCanceledException("Invoice not found");

        _invoiceManagerDB.Update(invoice);
        await _invoiceManagerDB.SaveChangesAsync();
    }

    public async Task UpdateStatusAsync(Invoice invoice)
    {
        if (!invoice.IsArchived) throw new OperationCanceledException("Invoice not found");


        _invoiceManagerDB.Update(invoice);
        await _invoiceManagerDB.SaveChangesAsync();
    }
}
