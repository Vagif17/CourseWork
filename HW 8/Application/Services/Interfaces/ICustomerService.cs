using Application.Common;
using Application.DTOs;
using Domain;

namespace Application.Services.Interfaces;

public interface ICustomerService
{
    public Task<CustomerResponseDTO> CreateCustomerAsync(CreateCustomerRequestDTO createCustomerRequest,string UserId);
    public Task<CustomerResponseDTO> GetCustomerByIdAsync(int id, string UserId);
    public Task<IEnumerable<CustomerResponseDTO>> GetAllCustomersAsync(string UserId);
    public Task<CustomerResponseDTO> UpdateCustomerAsync(int id, UpdateCustomerRequestDTO updateCustomerRequest, string UserId);
    public Task<bool> DeleteCustomerAsync(int id, string UserId);
    public Task<bool> ArchiveCustomerAsync(int id, string UserId);
    public Task<Pages<CustomerResponseDTO>> GetPagesAsync (CustomerQueryParams queryParams, string UserId);

}

// UserId я везде кидаю чтобы с конкретным кастомером мог работать только тот User который его создал,инвойсы кастомерам могут давать и другие юзеры
// но изменять юзеров может только тот кто их создал. 
