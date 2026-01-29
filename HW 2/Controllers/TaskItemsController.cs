using ASP_NET_07._TaskFlow_Introduction.Models;
using ASP_NET_07._TaskFlow_Introduction.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ASP_NET_07._TaskFlow_Introduction.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TaskItemsController : ControllerBase
{
    private readonly ITaskItemService _taskItemService;
    public TaskItemsController(ITaskItemService taskItemService)
    {
        _taskItemService = taskItemService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var taskItems = await _taskItemService.GetAllAsync();
        return Ok(taskItems);
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetById(int id)
    {
        var taskItem = await _taskItemService.GetByIdAsync(id);
        if (taskItem is null)
            return NotFound($"TaskItem with ID {id} not found");
        return Ok(taskItem);
    }


    [HttpPost]
    public async Task<ActionResult<TaskItem>> Create([FromBody] TaskItem taskItem)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var createdTaskItem = await _taskItemService.CreateAsync(taskItem);
        return CreatedAtAction(
            nameof(GetAll),
            new { id = createdTaskItem.Id },
            createdTaskItem);
    }

}
