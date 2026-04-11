using Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NewsController : ControllerBase
{
    private readonly INewsFeedService newsFeedService;
    private readonly IHttpClientFactory httpClientFactory;

    public NewsController(INewsFeedService newsFeedService, IHttpClientFactory httpClientFactory)
    {
        this.newsFeedService = newsFeedService;
        this.httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Proxies a remote news image (BBC, IGN CDNs only) so the browser can load it without hotlink/referrer issues.
    /// </summary>
    [HttpGet("feed-image")]
    public async Task<IActionResult> GetFeedImage([FromQuery] string url, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(url) || !Uri.TryCreate(url.Trim(), UriKind.Absolute, out var uri))
            return BadRequest();

        if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
            return BadRequest();

        if (!IsAllowedNewsImageHost(uri))
            return BadRequest();

        try
        {
            var client = httpClientFactory.CreateClient("RssNewsFeedService");
            client.DefaultRequestHeaders.UserAgent.ParseAdd(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36");
            client.DefaultRequestHeaders.Accept.ParseAdd("image/*,*/*;q=0.8");

            using var resp = await client.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, cancellationToken).ConfigureAwait(false);
            if (!resp.IsSuccessStatusCode)
                return NotFound();

            await using var stream = await resp.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
            await using var buffer = new MemoryStream();
            await stream.CopyToAsync(buffer, cancellationToken).ConfigureAwait(false);
            if (buffer.Length == 0 || buffer.Length > 3_500_000)
                return BadRequest();

            var bytes = buffer.ToArray();
            var mediaType = resp.Content.Headers.ContentType?.MediaType ?? "image/jpeg";
            if (!mediaType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
                && !HasKnownImageExtension(uri.AbsolutePath))
            {
                mediaType = SniffImageContentType(bytes) ?? string.Empty;
                if (string.IsNullOrEmpty(mediaType))
                    return BadRequest();
            }

            return File(bytes, mediaType);
        }
        catch
        {
            return NotFound();
        }
    }

    private static string? SniffImageContentType(ReadOnlySpan<byte> data)
    {
        if (data.Length >= 3 && data[0] == 0xFF && data[1] == 0xD8 && data[2] == 0xFF)
            return "image/jpeg";
        if (data.Length >= 8 && data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47)
            return "image/png";
        if (data.Length >= 12 && data[0] == 0x52 && data[1] == 0x49 && data[2] == 0x46 && data[3] == 0x46
            && data[8] == 0x57 && data[9] == 0x45 && data[10] == 0x42 && data[11] == 0x50)
            return "image/webp";
        if (data.Length >= 6 && data[0] == 0x47 && data[1] == 0x49 && data[2] == 0x46)
            return "image/gif";
        return null;
    }

    private static bool HasKnownImageExtension(string path)
    {
        var p = path.ToLowerInvariant();
        return p.EndsWith(".jpg", StringComparison.Ordinal)
            || p.EndsWith(".jpeg", StringComparison.Ordinal)
            || p.EndsWith(".png", StringComparison.Ordinal)
            || p.EndsWith(".webp", StringComparison.Ordinal)
            || p.EndsWith(".gif", StringComparison.Ordinal)
            || p.EndsWith(".avif", StringComparison.Ordinal);
    }

    private static bool IsAllowedNewsImageHost(Uri uri)
    {
        var host = uri.Host;
        if (string.IsNullOrEmpty(host))
            return false;

        host = host.ToLowerInvariant();
        if (host.EndsWith(".bbc.co.uk", StringComparison.Ordinal) || host.EndsWith(".bbci.co.uk", StringComparison.Ordinal))
            return true;

        if (host == "ignimgs.com" || host.EndsWith(".ignimgs.com", StringComparison.Ordinal))
            return true;

        if (host.EndsWith(".assets.images.ign.com", StringComparison.Ordinal))
            return true;

        if (host.Equals("s3.amazonaws.com", StringComparison.Ordinal)
            && uri.AbsolutePath.Contains("ign", StringComparison.OrdinalIgnoreCase))
            return true;

        ReadOnlySpan<string> roots =
        [
            "ichef.bbci.co.uk",
            "c.files.bbci.co.uk",
            "static.files.bbci.co.uk",
            "media.ign.com",
            "sm.ign.com",
            "terrigen-static.cdn.prodaa.net",
        ];

        foreach (var r in roots)
        {
            if (host == r || host.EndsWith("." + r, StringComparison.Ordinal))
                return true;
        }

        return false;
    }

    /// <summary>
    /// Категории: sports, world, popculture, games (RSS-источники, кэш ~10 мин).
    /// </summary>
    [HttpGet("{category}")]
    public async Task<IActionResult> GetByCategory(string category, CancellationToken cancellationToken)
    {
        var items = await newsFeedService.GetArticlesAsync(category, cancellationToken);
        return Ok(items);
    }
}
