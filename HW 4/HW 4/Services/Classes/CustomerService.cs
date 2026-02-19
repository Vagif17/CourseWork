using AutoMapper;
using HW_4.DB_s;
using HW_4.DTO_s;
using HW_4.Models;
using HW_4.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HW_4.Services.Classes;

public class CustomerService : ICustomerService
{
    private readonly InvoiceManagerDB invoiceManagerDB;
    private readonly IMapper mapper;

    public CustomerService(InvoiceManagerDB _invoiceManagerDB,IMapper _mapper)
    {
        invoiceManagerDB = _invoiceManagerDB;
        mapper = _mapper;
    }

    public async Task<CustomerResponseDTO> CreateCustomerAsync(CreateCustomerRequestDTO customer)
    {
        var customerToCreate = mapper.Map<Customer>(customer);
        await invoiceManagerDB.Customers.AddAsync(customerToCreate);
        await invoiceManagerDB.SaveChangesAsync();
        return mapper.Map<CustomerResponseDTO>(customerToCreate);
    }

    public async Task<IEnumerable<CustomerResponseDTO>> GetAllCustomersAsync()
    {
        var allCustomers = await invoiceManagerDB.Customers
            .Where(i => !i.IsArchived)
            .ToListAsync();
        if (allCustomers == null || !allCustomers.Any())
            throw new Exception("No customers found.");

        return mapper.Map<IEnumerable<CustomerResponseDTO>>(allCustomers);
    }

    public async Task<CustomerResponseDTO> GetCustomerByIdAsync(int id)
    {
        return mapper.Map<CustomerResponseDTO>(await invoiceManagerDB.Customers.Where(i => !i.IsArchived)
            .FirstOrDefaultAsync(c => c.Id == id) ?? throw new Exception($"Customer with id {id} not found."));
    }

    public async Task<CustomerResponseDTO> UpdateCustomerAsync(int id, UpdateCustomerRequestDTO customer)
    {
        var customerToUpdate = await invoiceManagerDB.Customers
            .AnyAsync(c => c.Id == id) ? await invoiceManagerDB.Customers
            .FirstOrDefaultAsync(c => c.Id == id) :
            throw new Exception($"Customer with id {id} not found");
        
        mapper.Map(customer, customerToUpdate);
        invoiceManagerDB.Customers.Update(customerToUpdate);
        await invoiceManagerDB.SaveChangesAsync();
        return mapper.Map<CustomerResponseDTO>(customerToUpdate);
    }

    public async Task<bool> DeleteCustomerAsync(int id) 
    {
        var CustomerInvoice = await invoiceManagerDB.Invoices
            .AnyAsync(c => c.Id == id) ? await invoiceManagerDB.Invoices
            .FirstOrDefaultAsync(c => c.Id == id) :
            throw new Exception($"Customer with id {id} not found");

        if (CustomerInvoice.Status != InvoiceStatus.Created)
            throw new Exception("Customer cannot be deleted because they have an invoice that is not in 'Created' status.");
        
        invoiceManagerDB.Customers.Remove(await invoiceManagerDB.Customers.FirstOrDefaultAsync(c => c.Id == id)); 
        await invoiceManagerDB.SaveChangesAsync(); 
        
        return true;
    }

    public async Task<bool> ArchiveCustomerAsync(int id)
    {
        var customerToArchive = await invoiceManagerDB.Customers
            .AnyAsync(c => c.Id == id) ? await invoiceManagerDB.Customers
            .FirstOrDefaultAsync(c => c.Id == id) :
            throw new Exception($"Customer with id {id} not found");

        customerToArchive.IsArchived = true;
        invoiceManagerDB.Customers.Update(customerToArchive);
        await invoiceManagerDB.SaveChangesAsync();

        return true;
    }
}
