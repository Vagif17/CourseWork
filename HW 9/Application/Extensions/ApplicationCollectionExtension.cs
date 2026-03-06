using API.Services.Interfaces;
using Application.Mapping;
using Application.Services.Classes;
using Application.Services.Interfaces;
using Application.Validators.UserValidators;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Extensions;

public static class ApplicationCollectionExtension
{
    public static IServiceCollection AddApplication (this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<UserRegisterValidator>();
        services.AddAutoMapper(typeof(MappingProfile));
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IExportService, ExportService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IInvoiceRowService, InvoiceRowService>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}
