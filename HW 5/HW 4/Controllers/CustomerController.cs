using HW_4.Common;
using HW_4.DTO_s;
using HW_4.Models;
using HW_4.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HW_4.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService customerService;
    public CustomerController(ICustomerService _customerService)
    {
        customerService = _customerService;
    }

    #region PostMethods

    /// <summary>
    /// Create customer.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CustomerResponseDTO>> CreateCustomerAsync([FromBody] CreateCustomerRequestDTO customer)
    {
        var newCustomer = await customerService.CreateCustomerAsync(customer);
        return Ok(newCustomer);
  
    }

    #endregion

    #region GetMethods

    /// <summary>
    /// Show all customers.
    /// </summary>
    /// 
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<CustomerResponseDTO>>> GetAllCustomers()
    {
        var customers = await customerService.GetAllCustomersAsync();
        return Ok(customers);
        
    }

    /// <summary>
    /// Show customers with pages.
    /// </summary>
    /// 
    [HttpGet]
    public async Task<ActionResult<Pages<IEnumerable<CustomerResponseDTO>>>> GetPaged([FromQuery] CustomerQueryParams queryParams)
    {
        var result = await customerService.GetPagesAsync(queryParams);
        return Ok(result);

    }


    /// <summary>
    /// Show customer by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerResponseDTO>> GetCustomerById(int id)
    {
        var customer = await customerService.GetCustomerByIdAsync(id);
        return Ok(customer);
    }


    #endregion

    #region PutMethods

    /// <summary>
    /// Update customer by id.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UpdateCustomerRequestDTO>> UpdateCustomer(int id, [FromBody] UpdateCustomerRequestDTO customer)
    {
        var updatedCustomer = await customerService.UpdateCustomerAsync(id, customer);
        return Ok(updatedCustomer);
    }

    #endregion

    #region PatchMethods


    /// <summary>
    /// Archive customer by id.
    /// </summary>
    [HttpPatch("{id}/archive")]
    public async Task<ActionResult<CustomerResponseDTO>> ArchiveCustomer(int id)
    {
        await customerService.ArchiveCustomerAsync(id);
        return Ok($"Customer with ID {id} has been archived.");
    }
    #endregion

    #region DeleteMethods

    /// <summary>
    /// Delete customer by id.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<bool>> DeleteCustomer(int id)
    {

        var deletedCustomer = await customerService.DeleteCustomerAsync(id);
        return Ok($"Customer with id {id} has been deleted");

    }

    #endregion

}