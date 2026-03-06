using Application.Config;
using Application.Interfaces;
using Infrastructure.Data;
using Infrastructure.Identities;
using Infrastructure.JWT;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Extensions;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastruture (this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JWTConfig>(configuration.GetSection(JWTConfig.SectionName));

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<InvoiceManagerDB>(options => options.UseSqlServer(connectionString));

        services.AddScoped<ICustomerRepository,CustomerRepository>();
        services.AddScoped<IInvoiceRepository,InvoiceRepository>();
        services.AddScoped<IInvoiceRowRepository, InvoiceRowRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IUserStore, UserStore>();


        return services;
    }
}
