namespace Application.Helpers;

public static class MessagePreviewFormatter
{
    public static string? ToPreview(string? text, string? mediaUrl, string? mediaType)
    {
        if (!string.IsNullOrWhiteSpace(text))
        {
            var t = text.Trim();
            return t.Length > 160 ? t[..160] + "…" : t;
        }

        if (string.IsNullOrWhiteSpace(mediaUrl))
            return null;

        if (mediaType?.StartsWith("image", StringComparison.OrdinalIgnoreCase) == true)
            return "Photo";
        if (mediaType?.StartsWith("video", StringComparison.OrdinalIgnoreCase) == true)
            return "Video";
        if (mediaType?.StartsWith("audio", StringComparison.OrdinalIgnoreCase) == true)
            return "Voice message";
        return "Attachment";
    }
}
