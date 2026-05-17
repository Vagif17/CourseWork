namespace Application.Services.Interfaces;

public interface IAIService
{
    public Task<string> GenerateSummaryAsync(string chatHistory);
}
