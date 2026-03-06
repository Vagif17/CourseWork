using Application.Common;
using Application.DTOs;
using Application.Interfaces;
using Application.Services.Interfaces;
using AutoMapper;
using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Classes;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository customerRepository;
    private readonly IMapper mapper;

    public CustomerService(ICustomerRepository _customerRepository, IMapper _mapper)
    {
        customerRepository = _customerRepository;
        mapper = _mapper;
    }


    public async Task<bool> ArchiveCustomerAsync(int id, string UserId)
    {
        var customer = await customerRepository.FindAsync(id);

        if (customer.UserId !=  UserId) throw new OperationCanceledException("You don't have access to this customer");

        if (customer is null) return false;

        await customerRepository.ArchiveAsync(customer);
        return true;
    }

    public async Task<CustomerResponseDTO> CreateCustomerAsync(CreateCustomerRequestDTO createCustomerRequest, string UserId)
    {
        var customer = mapper.Map<Customer>(createCustomerRequest);
        var added = await customerRepository.AddAsync(customer);
        return mapper.Map<CustomerResponseDTO>(added);
    }

    public async Task<bool> DeleteCustomerAsync(int id, string UserId)
    {
        var customer = await customerRepository.FindAsync(id);
        if (customer.UserId != UserId) throw new OperationCanceledException("You don't have access to this customer");


        if (customer is null) return false;

        await customerRepository.DeleteAsync(customer);
        return true;
    }

    public async Task<IEnumerable<CustomerResponseDTO>> GetAllCustomersAsync(string UserId)
    {
        var customers = await customerRepository.GetAllAsync();

        return mapper.Map<IEnumerable<CustomerResponseDTO>>(customers.Where(c => c.UserId == UserId));
    }

    public async Task<CustomerResponseDTO> GetCustomerByIdAsync(int id, string UserId)
    {
        var customer = await customerRepository.FindAsync(id);

        if (customer is null ) throw new InvalidOperationException("User not found"); ;

        return mapper.Map<CustomerResponseDTO>(customer);
    }

    public async Task<Pages<CustomerResponseDTO>> GetPagesAsync(CustomerQueryParams queryParams, string UserId)
    {
        queryParams.Validate();
        var (Customers, totalCount) = await customerRepository.GetPagedAsync(
            queryParams.Search,
            queryParams.Sort,
            queryParams.SortDirection,
            queryParams.Page,
            queryParams.PageSize);
        var customerDtos = mapper.Map<IEnumerable<CustomerResponseDTO>>(Customers);
        return Pages<CustomerResponseDTO>.Create(customerDtos, queryParams.Page, queryParams.PageSize, totalCount);
    }

    public async Task<CustomerResponseDTO> UpdateCustomerAsync(int id, UpdateCustomerRequestDTO updateCustomerRequest, string UserId)
    {
        var customer = await customerRepository.FindAsync(id);
        if (customer is null || customer.UserId != UserId) return null;

        mapper.Map(updateCustomerRequest, customer);
        await customerRepository.UpdateAsync(customer);

        return mapper.Map<CustomerResponseDTO>(customer);
    }
}
