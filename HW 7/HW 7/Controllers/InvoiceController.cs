using AutoMapper;
using HW_7.Common;
using HW_7.DTO_s;
using HW_7.Models;
using HW_7.Services.Classes;
using HW_7.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HW_7.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
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


    /// <summary>
    /// Download invoice by id.
    /// </summary>("download/{id}")
    [HttpGet("download/{id}")]
    public async Task<ActionResult<InvoiceResponseDTO>> DownloadInvoiceById(int id)
    {
        var ms = await invoiceService.DownloadInvoiceAsync(id);

        return File(
            ms,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            $"Invoice_{id}.docx"
        );
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
    [Authorize(Policy = "AdminOnly")] // Статусы инвойса могут менять только Админы
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
