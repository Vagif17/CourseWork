using Application.Config;
using Application.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;
using System.Net.Http;

namespace Infrastructure.Services;

public class AIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly OpenAISettings _settings;
    private readonly bool _isGeminiEnabled;

    public AIService(IOptions<OpenAISettings> options)
    {
        _settings = options.Value;
        _httpClient = new HttpClient();
        _isGeminiEnabled = !string.IsNullOrEmpty(_settings.GeminiApiKey) && _settings.GeminiApiKey != "YOUR_GEMINI_API_KEY_HERE";
    }

    public async Task<string> GenerateSummaryAsync(string chatHistory)
    {
        var prompt = $@"Please provide a concise summary of the following chat conversation in the same language as the chat.
After the summary, if you find any critically important information such as:
- Meetings or appointments (time and place)
- Deadline changes or school/work schedule updates
- Announcements about holidays, celebrations, or serious incidents (birthdays, weddings, illness, etc.)
- Urgent calls to action

Please list them clearly after a line that says 'IMPORTANT:'. If no such information is found, do not add the IMPORTANT section.

Chat History:
{chatHistory}";

        return await GetTextResponse(prompt);
    }


    private async Task<string> GetTextResponse(string prompt, string fallback = "Error generating response")
    {
        if (_settings.Provider == "Gemini" && _isGeminiEnabled)
        {
            try
            {
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_settings.GeminiApiKey}";
                var payload = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = prompt } } }
                    }
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    return doc.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text").GetString() ?? fallback;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gemini Error: {ex.Message}");
            }
        }

        // Fallback to Pollinations.ai (Free Text AI)
        try
        {
            var pollinationUrl = "https://text.pollinations.ai/";
            var payload = new
            {
                messages = new[] { new { role = "user", content = prompt } },
                model = "openai" // Pollinations uses openai-like models for free
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(pollinationUrl, content);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsStringAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Pollinations Fallback Error: {ex.Message}");
        }

        return fallback;
    }
}
