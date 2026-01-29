using ASP_NET_07._TaskFlow_Introduction.Data;
using ASP_NET_07._TaskFlow_Introduction.Models;
using ASP_NET_07._TaskFlow_Introduction.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ASP_NET_07._TaskFlow_Introduction.Services;

public class TaskItemService : ITaskItemService
{
    private readonly TaskFlowDbContext _context;

    public TaskItemService(TaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<TaskItem> CreateAsync(TaskItem taskItem)
    {
        taskItem.CreatedAt = DateTimeOffset.UtcNow;
        taskItem.UpdatedAt = null;

        _context.TaskItems.Add(taskItem);
        await _context.SaveChangesAsync();

        return taskItem;
    }

    public Task<bool> DeleteAsync(int id)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<TaskItem>> GetAllAsync()
    {
        return await _context
            .TaskItems
            .Include(t => t.Project)
            .ToListAsync();
           ;
    }

    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await _context
            .TaskItems
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<TaskItem>> GetByProjectIdAsync(int projectId)
    {
        return await _context
            .TaskItems
            .Where(t => t.ProjectId == projectId)
            .Include(t => t.Project)
            .ToListAsync();
    }

    public Task<TaskItem?> UpdateAsync(int id, TaskItem taskItem)
    {
        throw new NotImplementedException();
    }
}
