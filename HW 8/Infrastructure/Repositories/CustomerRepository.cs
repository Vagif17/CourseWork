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

public class CustomerRepository : ICustomerRepository
{

    private readonly InvoiceManagerDB _invoiceManagerDB;

    public CustomerRepository(InvoiceManagerDB invoiceManagerDB)
    {
        _invoiceManagerDB = invoiceManagerDB;
    }

    public async Task<Customer> AddAsync(Customer customer)
    {
        await _invoiceManagerDB.Customers.AddAsync(customer);
        await _invoiceManagerDB.SaveChangesAsync();

        return customer;
    }

    public async Task<Customer?> ArchiveAsync(Customer customer)
    {
        if (customer.IsArchived) throw new OperationCanceledException("Customer already archived");

        customer.IsArchived = true;

        _invoiceManagerDB.Customers.Update(customer);
        await _invoiceManagerDB.SaveChangesAsync();

        return customer;
    }

    public async Task DeleteAsync(Customer customer)
    {
       _invoiceManagerDB.Customers.Remove(customer);

        await _invoiceManagerDB.SaveChangesAsync();
    }

    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        return await _invoiceManagerDB.Customers.Where(c => !c.IsArchived).ToListAsync();
    }

    public async Task<Customer> FindAsync(int Id)
    {
        return await _invoiceManagerDB.Customers.Where(c => !c.IsArchived).FirstOrDefaultAsync(i => i.Id == Id);
    }

    public async Task<(IEnumerable<Customer> customers, int TotalCount)> GetPagedAsync(string? search, string? sort, string? sortDirection, int page, int size)
    {
        var query = _invoiceManagerDB.Customers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(term)).Where(t => !t.IsArchived);
        }

        var totalCount = await query.CountAsync();
        var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        query = (sort?.ToLower()) switch
        {
            "Name" => isDesc ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name),
            "createdat" => isDesc ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
            _ => query.OrderByDescending(t => t.CreatedAt)
        };

        var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();
        return (items, totalCount);
    }

    public async Task<bool> IsCustomerExistsAsync(int Id)
    {
        var customer = await _invoiceManagerDB.Customers.Where(c => !c.IsArchived).FirstOrDefaultAsync(i => i.Id == Id); 

        return customer != null;
    }

    public async Task UpdateAsync(Customer customer)
    {
        if (!customer.IsArchived) throw new OperationCanceledException("Customer not found");


        _invoiceManagerDB.Customers.Update(customer);
        await _invoiceManagerDB.SaveChangesAsync();
    }
}
