using AutoMapper;
using HW_4.Common;
using HW_4.DB_s;
using HW_4.DTO_s;
using HW_4.Models;

namespace HW_4.Services.Interfaces;

public interface IInvoiceService
{
    public Task<InvoiceResponseDTO> CreateInvoiceAsync(CreateInvoiceRequestDTO invoice);
    public Task<InvoiceResponseDTO> GetInvoiceByIdAsync(int id);
    public Task<IEnumerable<InvoiceResponseDTO>> GetAllInvoicesAsync();
    public Task<InvoiceResponseDTO> UpdateInvoiceAsync(int id, UpdateInvoiceRequestDTO invoice);
    public Task<InvoiceResponseDTO> UpdateInvoiceStatusAsync(int id, InvoiceStatus newStatus);
    public Task<bool> DeleteInvoiceAsync(int id);
    public Task<bool> ArchiveInvoiceAsync(int id);
    public Task<Pages<InvoiceResponseDTO>> GetPagesAsync(InvoiceQueryParams queryParams);

}
