using HW_4.DTO_s;
using HW_4.Models;

namespace HW_4.Services.Interfaces;

public interface ICustomerService
{
    public Task<CustomerResponseDTO> CreateCustomerAsync(CreateCustomerRequestDTO customer);
    public Task<CustomerResponseDTO> GetCustomerByIdAsync(int id);
    public Task<IEnumerable<CustomerResponseDTO>> GetAllCustomersAsync();
    public Task<CustomerResponseDTO> UpdateCustomerAsync(int id, UpdateCustomerRequestDTO customer);
    public Task<bool> DeleteCustomerAsync(int id);
    public Task<bool> ArchiveCustomerAsync(int id);


}
