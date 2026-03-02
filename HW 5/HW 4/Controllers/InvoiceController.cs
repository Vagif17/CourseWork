using AutoMapper;
using HW_4.Common;
using HW_4.DTO_s;
using HW_4.Models;
using HW_4.Services.Classes;
using HW_4.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HW_4.Controllers;

[Route("api/[controller]")]
[ApiController]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService invoiceService;
    public InvoiceController(IInvoiceService _invoiceService)
    {
        invoiceService = _invoiceService;
    }


    #region PostMethods 

    /// <summary>
    /// Create invoice.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<InvoiceResponseDTO>> CreateInvoice([FromBody] CreateInvoiceRequestDTO invoice)
    {
        var newInvoice = await invoiceService.CreateInvoiceAsync(invoice);
        return Ok(newInvoice);
    }


    #endregion

    #region GetMethods

    /// <summary>
    /// Show all invoices.
    /// </summary>
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<InvoiceResponseDTO>>> GetAllInvoices()
    {
        var invoices = await invoiceService.GetAllInvoicesAsync();
        return Ok(invoices);
    }


    /// <summary>
    /// Show invoices with pages.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<Pages<IEnumerable<InvoiceResponseDTO>>>> GetPaged([FromQuery] InvoiceQueryParams queryParams)
    {
        var result = await invoiceService.GetPagesAsync(queryParams);
        return Ok(result);
    }


    /// <summary>
    /// Show invoice by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceResponseDTO>> GetInvoiceById(int id)
    {
        var invoice = await invoiceService.GetInvoiceByIdAsync(id);
        return Ok(invoice);
    }

    #endregion

    #region PutMethods

    /// <summary>
    /// Update invoice by id.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<InvoiceResponseDTO>> UpdateInvoice(int id, [FromBody] UpdateInvoiceRequestDTO invoice)
    {
        var updatedInvoice = await invoiceService.UpdateInvoiceAsync(id, invoice);
        return Ok(updatedInvoice);
    }

    #endregion

    #region PatchMethods

    /// <summary>
    /// Update invoice status by id.
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<InvoiceResponseDTO>> UpdateInvoiceStatus(int id, [FromBody] InvoiceStatus newStatus)
    {
        var updatedInvoice = await invoiceService.UpdateInvoiceStatusAsync(id, newStatus);
        return Ok(updatedInvoice);
    }



    /// <summary>
    /// Archive invoice by id.
    /// </summary>
    [HttpPatch("{id}/archive")]
    public async Task<ActionResult<bool>> ArchiveInvoice(int id)
    {
        await invoiceService.ArchiveInvoiceAsync(id);
        return Ok($"Invoice with id {id} has been archived");
    }

    #endregion

    #region DeleteMethods

    /// <summary>
    /// Delete invoice by id.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<bool>> DeleteInvoice(int id)
    {
        var deletedInvoice = await invoiceService.DeleteInvoiceAsync(id);
        return Ok($"Invoice with id {id} has been deleted");
    }

    #endregion
}
