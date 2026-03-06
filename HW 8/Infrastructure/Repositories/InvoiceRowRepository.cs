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

public class InvoiceRowRepository : IInvoiceRowRepository
{

    private readonly InvoiceManagerDB _invoiceManagerDB;
    public InvoiceRowRepository(InvoiceManagerDB invoiceManagerDB)
    {
        _invoiceManagerDB = invoiceManagerDB;
    }

    public async Task<InvoiceRow> AddAsync(InvoiceRow invoiceRow)
    {
        await _invoiceManagerDB.InvoiceRows.AddAsync(invoiceRow);
        await _invoiceManagerDB.SaveChangesAsync();

        return invoiceRow;
    }

    public async Task<IEnumerable<InvoiceRow>> GetAllAsync()
    {
        return await _invoiceManagerDB.InvoiceRows.ToListAsync();
    }

    public async Task<InvoiceRow> GetByIdAsync(int Id)
    {
        return await _invoiceManagerDB.InvoiceRows.FindAsync(Id);
    }

    public async Task UpdateAsync(InvoiceRow invoiceRow)
    {
        _invoiceManagerDB.InvoiceRows.Update(invoiceRow);

        await _invoiceManagerDB.SaveChangesAsync();
    }
}
