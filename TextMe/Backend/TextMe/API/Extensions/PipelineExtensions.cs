using Application.Middlewares;
using Infrastructure.Hubs;

namespace API.Extensions;

public static class PipelineExtensions
{
    public static WebApplication UseTaskFlowPipeLine(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "TextMeMessenger API v1");
                options.RoutePrefix = string.Empty;
                options.DisplayRequestDuration();
                options.EnableFilter();
                options.EnableTryItOutByDefault();
                options.EnablePersistAuthorization();
            });
            app.MapOpenApi();
        }
        app.UseMiddleware<GlobalExceptionMiddleware>();
        app.UseRouting();
        app.UseCors("AllowAll"); 
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.MapHub<ChatHub>("/hubs/chat");

        return app;
    }
}
