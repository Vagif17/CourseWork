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

public class InvoiceRowService : IInvoiceRowService
{
    private readonly IInvoiceRowRepository invoiceRowRepository;
    private readonly IMapper mapper;

    public InvoiceRowService(IInvoiceRowRepository _invoiceRowRepository,IMapper _mapper)
    {
        invoiceRowRepository = _invoiceRowRepository;
        mapper = _mapper;
    }


    public async Task<InvoiceRowResponseDTO> CreateInvoiceRowAsync(CreateInvoiceRowRequestDTO invoiceRowRequestDTO)
    {
        var invoiceRow = mapper.Map<InvoiceRow>(invoiceRowRequestDTO);
        var added = await invoiceRowRepository.AddAsync(invoiceRow);
        return mapper.Map<InvoiceRowResponseDTO>(added);
    }

    public async Task<IEnumerable<InvoiceRowResponseDTO>> GetAllInvoiceRowsAsync()
    {
        return mapper.Map<IEnumerable<InvoiceRowResponseDTO>>(await invoiceRowRepository.GetAllAsync());
    }

    public async Task<InvoiceRowResponseDTO> GetInvoiceRowByIdAsync(int id)
    {
        return mapper.Map<InvoiceRowResponseDTO>(await invoiceRowRepository.GetByIdAsync(id));
    }

    public async Task<InvoiceRowResponseDTO> UpdateInvoiceRowAsync(int id, UpdateInvoiceRowRequestDTO invoiceRowRequestDTO)
    {
        var invoiceRow = await invoiceRowRepository.GetByIdAsync(id);
        if (invoiceRow is null) return null;

        mapper.Map(invoiceRowRequestDTO, invoiceRow);
        await invoiceRowRepository.UpdateAsync(invoiceRow);

        return mapper.Map<InvoiceRowResponseDTO>(invoiceRow);
    }
}
