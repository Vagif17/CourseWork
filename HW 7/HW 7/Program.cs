using FluentValidation;
using FluentValidation.AspNetCore;
using Humanizer.Configuration;
using HW_7.Common;
using HW_7.Config;
using HW_7.DB_s;
using HW_7.Mapping;
using HW_7.Middlewares;
using HW_7.Models;
using HW_7.Services.Classes;
using HW_7.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Invoice Manager API",
        Description = "An ASP.NET Core Web API for managing invoices, customers, and invoice rows.",
        Contact = new OpenApiContact
        {
            Name = "Vaqif",
            Email = "vagif.aliev.17.04@gmail.com"
        }

    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }


    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = """
            JWT Authorization header 
            using Bearer scheme.
            Example: Bearer {token}
            """,
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                }, Array.Empty<string>()
            }
        });
});


builder.Services.AddDbContext<InvoiceManagerDB>(optionsAction =>
{
    optionsAction.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
    .AddEntityFrameworkStores<InvoiceManagerDB>()
    .AddDefaultTokenProviders();

var jwtSettings = builder.Configuration.GetSection("JWTSettings");
var secretKey = jwtSettings["SecretKey"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];




builder.Services
    .AddAuthentication(
    options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(
    options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!)),
            ClockSkew = TimeSpan.Zero
        };
    }
    );


builder.Services.Configure<JWTConfig>(builder.Configuration.GetSection(JWTConfig.SectionName));



builder.Services.AddAuthorization(
    options =>
    {
        options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin")); 
        options.AddPolicy("UserAndAbove", policy => policy.RequireRole("User","Admin")); // Юзеры не могут видить других юзеров,только инвойсы
    }
    );


builder.Services.AddScoped<ICustomerService,CustomerService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IInvoiceRowService, InvoiceRowService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IExportService, ExportService>();

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddFluentValidationAutoValidation();



builder.Services.AddAutoMapper(typeof(MappingProfile));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();



using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        await RoleSeeder.SeedRolesAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occured while seeding roles.");
    }
}

app.Run();
