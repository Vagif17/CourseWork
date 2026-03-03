using ASP_NET_07._TaskFlow_Introduction.Data;
using ASP_NET_07._TaskFlow_Introduction.Services;
using ASP_NET_07._TaskFlow_Introduction.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Environment.EnvironmentName = Environments.Development;

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnectionString");

builder.Services.AddDbContext<TaskFlowDbContext>(
    options => options.UseSqlServer(connectionString));

builder.Services.AddScoped<ITaskItemService, TaskItemService>();
builder.Services.AddScoped<IProjectService, ProjectService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

Console.WriteLine(app.Environment.EnvironmentName);
app.Run();