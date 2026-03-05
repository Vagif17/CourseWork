using AutoMapper;
using HW_7.Common;
using HW_7.DB_s;
using HW_7.DTO_s;
using HW_7.Models;
using HW_7.Services.Interfaces;
using Microsoft.Build.Framework;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using System.Security.Claims;

namespace HW_7.Services.Classes;

public class CustomerService : ICustomerService
{
    private readonly InvoiceManagerDB invoiceManagerDB;
    private readonly IMapper mapper;

    public CustomerService(InvoiceManagerDB _invoiceManagerDB, IMapper _mapper)
    {
        invoiceManagerDB = _invoiceManagerDB;
        mapper = _mapper;
    }

    public async Task<CustomerResponseDTO> CreateCustomerAsync(CreateCustomerRequestDTO customer,string UserId)
    {
        var customerToCreate = mapper.Map<Customer>(customer);
        customerToCreate.UserId = UserId;   
        await invoiceManagerDB.Customers.AddAsync(customerToCreate);
        await invoiceManagerDB.SaveChangesAsync();
        return mapper.Map<CustomerResponseDTO>(customerToCreate);
    }

    public async Task<IEnumerable<CustomerResponseDTO>> GetAllCustomersAsync(string UserId)
    {
        var allCustomers = await invoiceManagerDB.Customers
            .Where(i => !i.IsArchived)
            .Where(i => i.UserId == UserId)
            .ToListAsync();
        if (allCustomers == null || !allCustomers.Any())
            throw new Exception("No customers found.");

        return mapper.Map<IEnumerable<CustomerResponseDTO>>(allCustomers);
    }

    public async Task<CustomerResponseDTO> GetCustomerByIdAsync(int id, string UserId)
    {
        return mapper.Map<CustomerResponseDTO>(await invoiceManagerDB.Customers
            .Where(i => !i.IsArchived)
            .Where(i => i.UserId == UserId)
            .FirstOrDefaultAsync(c => c.Id == id) ?? throw new Exception($"Customer with id {id} not found."));
    }

    public async Task<CustomerResponseDTO> UpdateCustomerAsync(int id, UpdateCustomerRequestDTO customer, string UserId)
    {
        var customerToUpdate = await invoiceManagerDB.Customers
            .Where (i => !i.IsArchived)
            .Where (i => i.UserId == UserId)
            .AnyAsync(c => c.Id == id) ? await invoiceManagerDB.Customers
            .FirstOrDefaultAsync(c => c.Id == id) :
            throw new Exception($"Customer with id {id} not found");

        mapper.Map(customer, customerToUpdate);
        invoiceManagerDB.Customers.Update(customerToUpdate);
        await invoiceManagerDB.SaveChangesAsync();
        return mapper.Map<CustomerResponseDTO>(customerToUpdate);
    }

    public async Task<bool> DeleteCustomerAsync(int id,string UserId)
    {
        if (!await invoiceManagerDB.Customers.Where(i => !i.IsArchived).Where(i => i.UserId == UserId).AnyAsync())
            throw new Exception("Customer with id {id} not found");

        var CustomerInvoice = await invoiceManagerDB.Invoices
            .AnyAsync(c => c.CustomerId == id) ? await invoiceManagerDB.Invoices
            .FirstOrDefaultAsync(c => c.CustomerId == id) :
            throw new Exception($"Customer with id {id} not found");

        if (CustomerInvoice.Status != InvoiceStatus.Created)
            throw new Exception("Customer cannot be deleted because they have an invoice that is not in 'Created' status.");

        invoiceManagerDB.Customers.Remove(await invoiceManagerDB.Customers.FirstOrDefaultAsync(c => c.Id == id));
        await invoiceManagerDB.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ArchiveCustomerAsync(int id,string UserId)
    {
        var customerToArchive = await invoiceManagerDB.Customers
            .Where(c => c.UserId == UserId)
            .AnyAsync(c => c.Id == id) ? await invoiceManagerDB.Customers
            .FirstOrDefaultAsync(c => c.Id == id) :
            throw new Exception($"Customer with id {id} not found");

        customerToArchive.IsArchived = true;
        invoiceManagerDB.Customers.Update(customerToArchive);
        await invoiceManagerDB.SaveChangesAsync();

        return true;
    }

    public async Task<Pages<CustomerResponseDTO>> GetPagesAsync(CustomerQueryParams queryParams,string UserId)
    {
        queryParams.Validate();

        var customersQuery = invoiceManagerDB.Customers
            .Where(c => !c.IsArchived)
            .Where(c => c.UserId == UserId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(queryParams.Search))
        {
            var searchTerm = queryParams.Search.ToLower();

            customersQuery = customersQuery.Where(c => c.Name.ToLower().Contains(searchTerm)
            || c.Address.ToLower().Contains(searchTerm)
            || c.PhoneNumber.ToLower().Contains(searchTerm));
        }



        var totalCount = await invoiceManagerDB.Customers.CountAsync();

        var skip = (queryParams.Page - 1) * queryParams.PageSize;

        var tasks = await customersQuery
                            .Skip(skip)
                            .Take(queryParams.PageSize)
                            .ToListAsync();


        var taskDtos = mapper.Map<IEnumerable<CustomerResponseDTO>>(tasks);

        return Pages<CustomerResponseDTO>.Create(
            taskDtos,
            queryParams.Page,
            queryParams.PageSize,
            totalCount
            );
    }

}
