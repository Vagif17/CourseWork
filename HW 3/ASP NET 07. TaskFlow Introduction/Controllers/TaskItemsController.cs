using ASP_NET_07._TaskFlow_Introduction.Models;
using ASP_NET_07._TaskFlow_Introduction.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ASP_NET_07._TaskFlow_Introduction.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TaskItemsController : ControllerBase
{
    private readonly ITaskItemService taskItemService;

    public TaskItemsController(ITaskItemService _taskItemService)
    {
        taskItemService = _taskItemService;
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskItem>>> GetAll()
    {
        var projects = await taskItemService.GetAllAsync();
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetById(int id)
    {
        var project = await taskItemService.GetByIdAsync(id);
        if (project is null)
            return NotFound($"Task with ID {id} not found");
        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> Create([FromBody] TaskItem task)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var createdTask = await taskItemService.CreateAsync(task);

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdTask.Id },
            createdTask);
    }
}
