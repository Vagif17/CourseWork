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
        try
        {
            var newCustomer = await customerService.CreateCustomerAsync(customer);
            return Ok(newCustomer);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    #endregion

    #region GetMethods

    /// <summary>
    /// Show all customers.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerResponseDTO>>> GetAllCustomersAsync()
    {
        var customers = await customerService.GetAllCustomersAsync();
        
        if (customers == null) 
        {
            return NotFound("No customers found.");
        }

        return Ok(customers);
        
    }


    /// <summary>
    /// Show customer by id.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerResponseDTO>> GetCustomerByIdAsync(int id)
    {

        var customer = await customerService.GetCustomerByIdAsync(id);

        if (customer == null)
        {
            return NotFound($"Customer with ID {id} not found.");
        }

       return Ok(customer);

    }

    #endregion

    #region PutMethods

    /// <summary>
    /// Update customer by id.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UpdateCustomerRequestDTO>> UpdateCustomerAsync(int id, [FromBody] UpdateCustomerRequestDTO customer)
    {
        var updatedCustomer = await customerService.UpdateCustomerAsync(id, customer);
        if (updatedCustomer == null)
        {
            return NotFound($"Customer with ID {id} not found.");
        }
        return Ok(updatedCustomer);
    }

    #endregion

    #region PatchMethods


    /// <summary>
    /// Archive customer by id.
    /// </summary>
    [HttpPatch("{id}/archive")]
    public async Task<ActionResult<CustomerResponseDTO>> ArchiveCustomerAsync(int id)
    {
        try
        {
            await customerService.ArchiveCustomerAsync(id);
            return Ok($"Customer with ID {id} has been archived.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);  
        }
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
        if (!deletedCustomer)
        {
            return BadRequest($"Customer with ID {id} cannot be deleted.");
        }
        return Ok($"Customer with id {id} has been deleted");
    }

    #endregion

}