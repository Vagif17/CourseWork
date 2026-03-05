using HW_6.DTO_s;
using HW_6.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HW_6.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
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
        return Ok(invoiceRows);
    }

    /// <summary>
    /// Show invoice row by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceRowResponseDTO>> GetInvoiceRowById(int id)
    {
        var invoiceRow = await invoiceRowService.GetInvoiceRowByIdAsync(id);
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
        return Ok(updatedInvoiceRow);
    }

    #endregion
}
