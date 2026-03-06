using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces;

public interface IInvoiceRepository
{ 
    public Task<Invoice> AddAsync(Invoice invoice);
    public Task UpdateAsync(Invoice invoice);
    public Task UpdateStatusAsync(Invoice invoice);
    public Task DeleteAsync(Invoice invoice);
    public Task<IEnumerable<Invoice>> GetAllAsync();
    public Task<Invoice> GetByIdAsync(int Id);
    public Task<Invoice> ArchiveAsync(Invoice invoice);

    public Task<(IEnumerable<Invoice> invoices, int TotalCount)> GetPagedAsync(
        int? customertId,
        string? status,
        string? search,
        string? sort,
        string? sortDirection,
        int page,
        int size);
}
