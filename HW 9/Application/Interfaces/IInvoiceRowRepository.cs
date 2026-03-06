using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces;

public interface IInvoiceRowRepository
{
    public Task<InvoiceRow> AddAsync(InvoiceRow invoiceRow);
    public Task UpdateAsync(InvoiceRow invoiceRow);
    public Task<IEnumerable<InvoiceRow>> GetAllAsync();
    public Task<InvoiceRow> GetByIdAsync(int Id);
}
