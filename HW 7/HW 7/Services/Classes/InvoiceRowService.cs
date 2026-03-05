using AutoMapper;
using HW_7.DB_s;
using HW_7.DTO_s;
using HW_7.Models;
using HW_7.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HW_7.Services.Classes;

public class InvoiceRowService : IInvoiceRowService
{
    private readonly InvoiceManagerDB invoiceManagerDB;
    private readonly IMapper mapper;

    public InvoiceRowService(InvoiceManagerDB _invoiceManagerDB,IMapper _mapper)
    {
        invoiceManagerDB = _invoiceManagerDB;
        mapper = _mapper;
    }

    public async Task<InvoiceRowResponseDTO> CreateInvoiceRowAsync(CreateInvoiceRowRequestDTO invoiceRowRequestDTO)
    {
        
        var invoiceRowToCreate = mapper.Map<InvoiceRow>(invoiceRowRequestDTO);

        await invoiceManagerDB.InvoiceRows.AddAsync(invoiceRowToCreate);
        await invoiceManagerDB.Invoices.Where(i => i.Id == invoiceRowRequestDTO.InvoiceId)
            .ExecuteUpdateAsync(i => i.SetProperty(i => i.TotalSum, i => i.TotalSum + invoiceRowToCreate.Sum));
        await invoiceManagerDB.SaveChangesAsync();

        return mapper.Map<InvoiceRowResponseDTO>(invoiceRowToCreate);
    }

    public async Task<IEnumerable<InvoiceRowResponseDTO>> GetAllInvoiceRowsAsync()
    {
        var invoiceRows = await invoiceManagerDB.InvoiceRows.ToListAsync();
        return (invoiceRows.Count > 0) ? mapper.Map<IEnumerable<InvoiceRowResponseDTO>>(invoiceRows) : 
            throw new Exception("Invoices not found");
    }

    public async Task<InvoiceRowResponseDTO> GetInvoiceRowByIdAsync(int id)
    {
        return mapper.Map<InvoiceRowResponseDTO>(await invoiceManagerDB.InvoiceRows.FirstOrDefaultAsync(ir => ir.Id == id));
    }

    public async Task<InvoiceRowResponseDTO> UpdateInvoiceRowAsync(int id, UpdateInvoiceRowRequestDTO invoiceRowRequestDTO)
    {
        var invoiceRowToUpdate = await invoiceManagerDB.InvoiceRows
            .AnyAsync(c => c.Id == id) ? await invoiceManagerDB.InvoiceRows
            .FirstOrDefaultAsync(c => c.Id == id) : 
            throw new Exception($"Customer with id {id} not found");
       
        mapper.Map(invoiceRowRequestDTO, invoiceRowToUpdate);
        invoiceManagerDB.InvoiceRows.Update(invoiceRowToUpdate);
        await invoiceManagerDB.SaveChangesAsync();
        return mapper.Map<InvoiceRowResponseDTO>(invoiceRowToUpdate);
    }
}
