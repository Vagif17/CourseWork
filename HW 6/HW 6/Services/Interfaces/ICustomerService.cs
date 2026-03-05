using HW_6.Common;
using HW_6.DTO_s;
using HW_6.Models;

namespace HW_6.Services.Interfaces;

public interface ICustomerService
{
    public Task<CustomerResponseDTO> CreateCustomerAsync(CreateCustomerRequestDTO customer,string UserId);
    public Task<CustomerResponseDTO> GetCustomerByIdAsync(int id, string UserId);
    public Task<IEnumerable<CustomerResponseDTO>> GetAllCustomersAsync(string UserId);
    public Task<CustomerResponseDTO> UpdateCustomerAsync(int id, UpdateCustomerRequestDTO customer, string UserId);
    public Task<bool> DeleteCustomerAsync(int id, string UserId);
    public Task<bool> ArchiveCustomerAsync(int id, string UserId);
    public Task<Pages<CustomerResponseDTO>> GetPagesAsync (CustomerQueryParams queryParamas, string UserId);
}

// UserId я везде кидаю чтобы с конкретным кастомером мог работать только тот User который его создал,инвойсы кастомерам могут давать и другие юзеры
// но изменять юзеров может только тот кто их создал. 
