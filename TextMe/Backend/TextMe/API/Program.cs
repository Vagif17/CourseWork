using API.Extensions;
using Application.Extensions;
using Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMemoryCache();

builder.Services.AddControllers();

builder.Services.AddSwagger();

builder.Services.AddCorsPolicy();

builder.Services.AddIdentityAndJwt(builder.Configuration);
builder.Services.AddJwtAuthenticationAndAuthorization(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

builder.Services.AddSignalR();

var app = builder.Build();


app.UseTaskFlowPipeLine(); 

app.Run();