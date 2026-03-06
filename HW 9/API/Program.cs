using Application.Extensions;
using FluentValidation.AspNetCore;
using API.Extensions;
using Infrastructure.Extensions;


var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApplication()
    .AddInfrastruture(builder.Configuration)
    .AddIdentityAndJwt(builder.Configuration);

builder.Services.AddSwagger();
builder.Services.AddJwtAuthenticationAndAuthorization(builder.Configuration);
builder.Services.AddCorsPolicy();
builder.Services.AddFluentValidationAutoValidation();

var app = builder.Build();

app.UseTaskFlowPipeLine();
await app.EnsureRolesSeededAsync();

app.Run();

