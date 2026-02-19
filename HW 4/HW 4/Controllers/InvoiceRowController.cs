using HW_4.DTO_s;
using HW_4.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HW_4.Controllers;

[Route("api/[controller]")]
[ApiController]
public class InvoiceRowController : ControllerBase
{
    private readonly IInvoiceRowService invoiceRowService;
    
    public InvoiceRowController(IInvoiceRowService _invoiceRowService)
    {
        invoiceRowService = _invoiceRowService;
    }


    #region PostMethods

    /// <summary>
    /// Create invoice row.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<InvoiceRowResponseDTO>> CreateInvoiceRow([FromBody] CreateInvoiceRowRequestDTO invoiceRowCreateDto)
    {
        var result = await invoiceRowService.CreateInvoiceRowAsync(invoiceRowCreateDto);
        if (result == null)
            return BadRequest("Failed to create invoice row.");
        return Ok(result);
    }

    #endregion

    #region GetMethods

    /// <summary>
    /// Show all invoice rows.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceRowResponseDTO>>> GetAllInvoiceRows()
    {
        var invoiceRows = await invoiceRowService.GetAllInvoiceRowsAsync();
        if (invoiceRows.Count() < 1)
        {
            return BadRequest("No invoice rows");
        }
        return Ok(invoiceRows);
    }

    /// <summary>
    /// Show invoice row by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceRowResponseDTO>> GetInvoiceRowById(int id)
    {
        var invoiceRow = await invoiceRowService.GetInvoiceRowByIdAsync(id);
        if (invoiceRow == null)
        {
            return BadRequest($"Invoice row with id {id} not found");
        }
        return Ok(invoiceRow);
    }

    #endregion

    #region PutMethods  

    /// <summary>
    /// Update invoice row by id.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<InvoiceRowResponseDTO>> UpdateInvoiceRow(int id, [FromBody] UpdateInvoiceRowRequestDTO invoiceRowUpdateDto)
    {
        var updatedInvoiceRow = await invoiceRowService.UpdateInvoiceRowAsync(id, invoiceRowUpdateDto);
        if (updatedInvoiceRow == null)
            return BadRequest($"Failed to update invoice row with id {id}.");
        return Ok(updatedInvoiceRow);
    }

    #endregion
}
