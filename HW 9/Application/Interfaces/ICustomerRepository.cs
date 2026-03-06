using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces;

public interface ICustomerRepository
{
    public Task<bool> IsCustomerExistsAsync(int Id);
    public Task<Customer> AddAsync(Customer customer);
    public Task UpdateAsync(Customer customer);
    public Task DeleteAsync(Customer customer);
    public Task<Customer?> ArchiveAsync(Customer customer);
    public Task<IEnumerable<Customer>> GetAllAsync();
    public Task<Customer> FindAsync(int Id);
    public Task<(IEnumerable<Customer> customers, int TotalCount)> GetPagedAsync(
        string? search,
        string? sort,
        string? sortDirection,
        int page,
        int size);
}


