using ASP_NET_07._TaskFlow_Introduction.Data;
using ASP_NET_07._TaskFlow_Introduction.Models;
using ASP_NET_07._TaskFlow_Introduction.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ASP_NET_07._TaskFlow_Introduction.Services;

public class TaskItemService : ITaskItemService
{
    private readonly TaskFlowDbContext taskFlowDbContext;

    public TaskItemService(TaskFlowDbContext _taskFlowDbContext)
    {
        taskFlowDbContext = _taskFlowDbContext;
    }

    public async Task<TaskItem> CreateAsync(TaskItem taskItem)
    {
        taskItem.CreatedAt = DateTime.UtcNow;
        taskItem.UpdatedAt = null;

        taskFlowDbContext.TaskItems.Add(taskItem);
        await taskFlowDbContext.SaveChangesAsync();


        return taskItem;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        taskFlowDbContext.TaskItems.Remove(await taskFlowDbContext.TaskItems.FirstOrDefaultAsync(x => x.Id == id));

        return true;
    }

    public async Task<IEnumerable<TaskItem>> GetAllAsync()
    {
        return await taskFlowDbContext
            .TaskItems
            .Include(t => t.Project)
            .ToListAsync();
    }

    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        return await taskFlowDbContext
            .TaskItems
            .Include(t => t.Project)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<TaskItem>> GetByProjectIdAsync(int projectId)
    {
        return await taskFlowDbContext
                   .TaskItems
                   .Where(p => p.ProjectId == projectId)
                   .ToListAsync();
    }

    public async Task<TaskItem?> UpdateAsync(int id, TaskItem taskItem)
    {
        throw new NotImplementedException();
    }


}
