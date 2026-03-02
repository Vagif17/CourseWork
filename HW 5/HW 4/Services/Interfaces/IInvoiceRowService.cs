using HW_4.DTO_s;

namespace HW_4.Services.Interfaces;

public interface IInvoiceRowService
{
    public Task<InvoiceRowResponseDTO> CreateInvoiceRowAsync(CreateInvoiceRowRequestDTO invoiceRowRequestDTO);
    public Task<InvoiceRowResponseDTO> GetInvoiceRowByIdAsync(int id);
    public Task<IEnumerable<InvoiceRowResponseDTO>> GetAllInvoiceRowsAsync();
    public Task<InvoiceRowResponseDTO> UpdateInvoiceRowAsync(int id, UpdateInvoiceRowRequestDTO invoiceRowRequestDTO);
}
