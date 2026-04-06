using Application.Interfaces.Repositories;
using Application.Mapping;
using Application.Services.Classes;
using Application.Services.Interfaces;
using Application.Validators.UserValidators;
using FluentValidation;
using Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Application.Extensions;

public static class ApplicationCollectionExtension
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<UserRegisterValidator>();
        services.AddAutoMapper(cfg =>{ cfg.AddProfile<MappingProfile>(); });
        services.AddScoped<IAccountRestoreService, AccountRecoveryService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IMessageService, MessageService>();

        return services;
    }
}
