using Application.Interfaces.Repositories;
using Application.Mapping;
using Application.Services.Classes;
using Application.Services.Interfaces;
using Application.Validators.UserValidators;
using FluentValidation;
using Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Application.Extensions;

public static class ApplicationCollectionExtension
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddAutoMapper(cfg =>{ cfg.AddProfile<MappingProfile>(); });
        services.AddScoped<IAccountRestoreService, AccountRecoveryService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly())
);


        return services;
    }
}
