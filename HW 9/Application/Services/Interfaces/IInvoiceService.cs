using AutoMapper;
using Application.Common;
using Application.Storage;
using Application.DTOs;
using Domain;

namespace API.Services.Interfaces;

public interface IInvoiceService
{
    public Task<InvoiceResponseDTO> CreateInvoiceAsync(CreateInvoiceRequestDTO createInvoiceRequest);
    public Task<InvoiceResponseDTO> GetInvoiceByIdAsync(int id);
    public Task<IEnumerable<InvoiceResponseDTO>> GetAllInvoicesAsync();
    public Task<InvoiceResponseDTO> UpdateInvoiceAsync(int id, UpdateInvoiceRequestDTO updateInvoiceRequest);
    public Task<InvoiceResponseDTO> UpdateInvoiceStatusAsync(int id, InvoiceStatus newStatus);
    public Task<bool> DeleteInvoiceAsync(int id);
    public Task<bool> ArchiveInvoiceAsync(int id);
    public Task<Pages<InvoiceResponseDTO>> GetPagesAsync(InvoiceQueryParams queryParams);
    public Task<MemoryStream> DownloadInvoiceAsync(int id);
    public Task<IEnumerable<CustomerReportData>> GetCustomerReportAsync(DateTime from, DateTime to);
    public Task<IEnumerable<WorkReportData>> GetWorkReportAsync(DateTime from, DateTime to);
    public Task<IEnumerable<InvoiceStatusReportData>> GetInvoiceStatusReportAsync(DateTime from,DateTime to);
}
