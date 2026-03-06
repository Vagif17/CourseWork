using API.Services.Interfaces;
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

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository invoiceRepository;
    private readonly IMapper mapper;
    private readonly IExportService exportService;

    public InvoiceService(IInvoiceRepository _invoiceRepository,IMapper _mapper, IExportService _exportService)
    {
        invoiceRepository = _invoiceRepository;
        mapper = _mapper;
        exportService = _exportService;
    }


    public async Task<bool> ArchiveInvoiceAsync(int id)
    {
       var invoice = await invoiceRepository.GetByIdAsync(id);

        if (invoice is null) return false;

        await invoiceRepository.ArchiveAsync(invoice);
        return true;    
    }

    public async Task<InvoiceResponseDTO> CreateInvoiceAsync(CreateInvoiceRequestDTO createInvoiceRequest)
    {
        var invoice = mapper.Map<Invoice>(createInvoiceRequest);
        var added = await invoiceRepository.AddAsync(invoice);
        return mapper.Map<InvoiceResponseDTO>(added);
    }

    public async Task<bool> DeleteInvoiceAsync(int id)
    {
        var invoice = await invoiceRepository.GetByIdAsync(id);

        if (invoice is null) return false;

        await invoiceRepository.DeleteAsync(invoice);
        return true;
    }

    public async Task<MemoryStream> DownloadInvoiceAsync(int id)
    {
        var invoice = invoiceRepository.GetByIdAsync(id).Result;

        return await exportService.ExportInvoiceAsync(mapper.Map<Invoice>(invoice));
    }

    public async Task<IEnumerable<InvoiceResponseDTO>> GetAllInvoicesAsync()
    {
        return mapper.Map<IEnumerable<InvoiceResponseDTO>>(await invoiceRepository.GetAllAsync());
    }

    public async Task<InvoiceResponseDTO> GetInvoiceByIdAsync(int id)
    {
        return mapper.Map<InvoiceResponseDTO>( await invoiceRepository.GetByIdAsync(id));
    }

    public async Task<Pages<InvoiceResponseDTO>> GetPagesAsync(InvoiceQueryParams queryParams)
    {
        queryParams.Validate();
        var (invoices, totalCount) = await invoiceRepository.GetPagedAsync(
            queryParams.CustomerId,
            queryParams.Status,
            queryParams.Search,
            queryParams.Sort,
            queryParams.SortDirection,
            queryParams.Page,
            queryParams.PageSize);
        var invoiceDtos = mapper.Map<IEnumerable<InvoiceResponseDTO>>(invoices);
        return Pages<InvoiceResponseDTO>.Create(invoiceDtos, queryParams.Page, queryParams.PageSize, totalCount);
    }

    public async Task<InvoiceResponseDTO> UpdateInvoiceAsync(int id, UpdateInvoiceRequestDTO updateInvoiceRequest)
    {
        var invoice = await invoiceRepository.GetByIdAsync(id);
        if (invoice is null) return null;

        mapper.Map(updateInvoiceRequest, invoice);
        await invoiceRepository.UpdateAsync(invoice);
        
        return mapper.Map<InvoiceResponseDTO>(invoice);
    }

    public async Task<InvoiceResponseDTO> UpdateInvoiceStatusAsync(int id, InvoiceStatus newStatus)
    {
        var invoice = await invoiceRepository.GetByIdAsync(id);
        if (invoice is null) return null;

        invoice.Status = newStatus;
        await invoiceRepository.UpdateAsync(invoice);

        return mapper.Map<InvoiceResponseDTO>(invoice);
    }
}
