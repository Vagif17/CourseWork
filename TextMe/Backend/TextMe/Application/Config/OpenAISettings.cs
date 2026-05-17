namespace Application.Config;

public class OpenAISettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string GeminiApiKey { get; set; } = string.Empty;
    public string Provider { get; set; } = "OpenAI"; // "OpenAI" or "Gemini"
}
