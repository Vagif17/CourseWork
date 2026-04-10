using Application.Config;
using Application.Interfaces.Notifications;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Interfaces.Storages;
using Application.Interfaces.Stores;
using Infrastructure.Data;
using Infrastructure.Jwt;
using Infrastructure.Notifications;
using Infrastructure.Repositories;
using Infrastructure.Storages;
using Infrastructure.Stores;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TextMe.Repositories.Classes;

namespace Infrastructure.Extensions;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtConfig>(configuration.GetSection(JwtConfig.SectionName));
        services.Configure<CloudConfig>(configuration.GetSection(CloudConfig.SectionName));
        services.Configure<MailConfig>(configuration.GetSection("MailSettings"));

        var connectionString = configuration.GetConnectionString("TextMeDbContext");
        services.AddDbContext<TextMeDbContext>(options => options.UseSqlServer(connectionString));

        services.AddScoped<IChatRepository, ChatRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IAccountRestoreRepository, AccountRestoreRepository>();

        services.AddScoped<IChatNotification, ChatNotification>();
        services.AddScoped<IJwtTokenSerivce, JwtTokenService>();
        services.AddScoped<IUserStore, UserStore>();
        services.AddScoped<ICloudinaryStorage, CloudinaryStorage>();

        return services;
    }
}
