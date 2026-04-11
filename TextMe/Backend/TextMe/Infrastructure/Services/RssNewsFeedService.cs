using System.Net;
using System.ServiceModel.Syndication;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using Application.DTOs;
using Application.Interfaces.Services;
using Microsoft.Extensions.Caching.Memory;

namespace Infrastructure.Services;

public class RssNewsFeedService : INewsFeedService
{
    private readonly IHttpClientFactory httpClientFactory;
    private readonly IMemoryCache cache;
    private const string CachePrefix = "news_rss_v6_";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    private static readonly IReadOnlyDictionary<string, string> Feeds = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["sports"] = "https://feeds.bbci.co.uk/sport/rss.xml",
        ["world"] = "https://feeds.bbci.co.uk/news/world/rss.xml",
        ["popculture"] = "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
        ["games"] = "https://feeds.ign.com/ign/games-all"
    };

    public RssNewsFeedService(IHttpClientFactory httpClientFactory, IMemoryCache cache)
    {
        this.httpClientFactory = httpClientFactory;
        this.cache = cache;
    }

    public async Task<IReadOnlyList<NewsArticleDTO>> GetArticlesAsync(string category, CancellationToken cancellationToken = default)
    {
        var key = category.Trim().ToLowerInvariant();
        if (!Feeds.TryGetValue(key, out var feedUrl))
            return Array.Empty<NewsArticleDTO>();

        var cacheKey = CachePrefix + key;
        if (cache.TryGetValue(cacheKey, out IReadOnlyList<NewsArticleDTO>? cached) && cached != null)
            return cached;

        var articles = await FetchFeedAsync(feedUrl, cancellationToken).ConfigureAwait(false);
        cache.Set(cacheKey, articles, CacheDuration);
        return articles;
    }

    private async Task<IReadOnlyList<NewsArticleDTO>> FetchFeedAsync(string url, CancellationToken cancellationToken)
    {
        try
        {
            var client = httpClientFactory.CreateClient(nameof(RssNewsFeedService));
            client.DefaultRequestHeaders.UserAgent.ParseAdd("TextMeNewsBot/1.0 (+https://github.com)");

            await using var stream = await client.GetStreamAsync(new Uri(url), cancellationToken).ConfigureAwait(false);
            using var reader = XmlReader.Create(stream, new XmlReaderSettings { Async = true, DtdProcessing = DtdProcessing.Ignore });
            var feed = SyndicationFeed.Load(reader);
            if (feed == null)
                return Array.Empty<NewsArticleDTO>();

            var source = feed.Title?.Text ?? "News";
            var list = new List<NewsArticleDTO>();

            foreach (var item in feed.Items.Take(24))
            {
                var link = item.Links.FirstOrDefault(l => l.RelationshipType == "alternate")?.Uri?.AbsoluteUri
                    ?? item.Links.FirstOrDefault()?.Uri?.AbsoluteUri
                    ?? item.Id ?? string.Empty;

                if (string.IsNullOrWhiteSpace(link))
                    continue;

                var title = item.Title?.Text?.Trim() ?? "Untitled";
                var summaryHtml = item.Summary?.Text ?? string.Empty;
                var contentHtml = GetItemBodyHtml(item);
                var summary = PlainText(summaryHtml);
                var image = item.Links.FirstOrDefault(l =>
                    string.Equals(l.RelationshipType, "enclosure", StringComparison.OrdinalIgnoreCase)
                    && l.MediaType != null
                    && l.MediaType.StartsWith("image", StringComparison.OrdinalIgnoreCase))?.Uri?.AbsoluteUri;

                var extXml = GetElementExtensionsFlatXml(item);
                var aggregate = string.Join('\n', summaryHtml, contentHtml, extXml);

                image ??= TryExtractImageFromHtml(aggregate);
                image ??= TryExtractImageFromHtml(summaryHtml);
                image ??= TryExtractImageFromHtml(contentHtml);
                image ??= TryGetMediaThumbnailUrl(item);

                list.Add(new NewsArticleDTO
                {
                    Title = title,
                    Summary = string.IsNullOrWhiteSpace(summary) ? null : summary,
                    Link = link,
                    ImageUrl = image,
                    PublishedAt = item.PublishDate == default ? null : item.PublishDate.UtcDateTime,
                    Source = source
                });
            }

            return list;
        }
        catch
        {
            return Array.Empty<NewsArticleDTO>();
        }
    }

    private static string PlainText(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return string.Empty;
        var s = Regex.Replace(html, "<.*?>", string.Empty);
        return System.Net.WebUtility.HtmlDecode(s).Trim();
    }

    private static string? TryExtractImageFromHtml(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return null;

        var og = Regex.Match(
            html,
            @"property\s*=\s*[""']og:image[""'][^>]*?content\s*=\s*[""']([^""']+)[""']",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);
        if (!og.Success)
        {
            og = Regex.Match(
                html,
                @"content\s*=\s*[""']([^""']+)[""'][^>]*?property\s*=\s*[""']og:image[""']",
                RegexOptions.IgnoreCase | RegexOptions.Singleline);
        }

        if (og.Success && TryNormalizeImageUrl(og.Groups[1].Value) is { } fromOg && !LooksLikeTrackingPixel(fromOg))
            return fromOg;

        var mediaThumb = Regex.Match(
            html,
            @"<media:thumbnail\b[^>]*\burl\s*=\s*[""']([^""']+)[""']",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);
        if (!mediaThumb.Success)
        {
            mediaThumb = Regex.Match(
                html,
                @"<media:thumbnail\b[^>]*\burl\s*=\s*([^\s>]+)",
                RegexOptions.IgnoreCase | RegexOptions.Singleline);
        }

        if (mediaThumb.Success && TryNormalizeImageUrl(mediaThumb.Groups[1].Value) is { } fromMt && !LooksLikeTrackingPixel(fromMt))
            return fromMt;

        foreach (Match im in Regex.Matches(html, @"<img\b[^>]*>", RegexOptions.IgnoreCase | RegexOptions.Singleline))
        {
            var tag = im.Value;
            foreach (var raw in new[] { ExtractAttr(tag, "src"), ExtractAttr(tag, "data-src"), FirstSrcsetUrl(tag) })
            {
                if (string.IsNullOrWhiteSpace(raw))
                    continue;
                if (TryNormalizeImageUrl(raw) is not { } abs)
                    continue;
                if (LooksLikeTrackingPixel(abs))
                    continue;
                return abs;
            }
        }

        var mediaContent = Regex.Match(
            html,
            @"<media:content\b[^>]*\burl\s*=\s*[""']([^""']+)[""']",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);
        if (mediaContent.Success && TryNormalizeImageUrl(mediaContent.Groups[1].Value) is { } fromMc && !LooksLikeTrackingPixel(fromMc))
            return fromMc;

        var mediaThumbText = Regex.Match(
            html,
            @"<media:thumbnail\b[^>]*>\s*([^\s<]+)\s*</media:thumbnail>",
            RegexOptions.IgnoreCase | RegexOptions.Singleline);
        if (mediaThumbText.Success && TryNormalizeImageUrl(mediaThumbText.Groups[1].Value) is { } fromMtt && !LooksLikeTrackingPixel(fromMtt))
            return fromMtt;

        var ignAsset = Regex.Match(
            html,
            @"https://[a-z0-9.-]*\bignimgs\.com/[^""'\s<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^\s""'<>]*)?",
            RegexOptions.IgnoreCase);
        if (ignAsset.Success && TryNormalizeImageUrl(ignAsset.Value) is { } ignU && !LooksLikeTrackingPixel(ignU))
            return ignU;

        return null;
    }

    private static string GetItemBodyHtml(SyndicationItem item)
    {
        if (item.Content is TextSyndicationContent tc)
            return tc.Text ?? string.Empty;
        if (item.Content is XmlSyndicationContent xc)
        {
            try
            {
                using var r = xc.GetReaderAtContent();
                return r.ReadOuterXml();
            }
            catch
            {
                return string.Empty;
            }
        }

        return string.Empty;
    }

    private static string GetElementExtensionsFlatXml(SyndicationItem item)
    {
        var sb = new StringBuilder();
        foreach (var ext in item.ElementExtensions)
        {
            try
            {
                using var r = ext.GetReader();
                sb.Append(r.ReadOuterXml());
            }
            catch
            {
                // ignore
            }
        }

        return sb.ToString();
    }

    private static string? ExtractAttr(string tag, string name)
    {
        var m = Regex.Match(
            tag,
            $@"\b{Regex.Escape(name)}\s*=\s*""([^""]*)""",
            RegexOptions.IgnoreCase);
        if (m.Success)
            return m.Groups[1].Value.Trim();

        m = Regex.Match(
            tag,
            $@"\b{Regex.Escape(name)}\s*=\s*'([^']*)'",
            RegexOptions.IgnoreCase);
        if (m.Success)
            return m.Groups[1].Value.Trim();

        m = Regex.Match(
            tag,
            $@"\b{Regex.Escape(name)}\s*=\s*([^\s>]+)",
            RegexOptions.IgnoreCase);
        return m.Success ? m.Groups[1].Value.Trim() : null;
    }

    private static string? FirstSrcsetUrl(string tag)
    {
        var m = Regex.Match(tag, @"\bsrcset\s*=\s*""([^""]+)""", RegexOptions.IgnoreCase);
        if (!m.Success)
            m = Regex.Match(tag, @"\bsrcset\s*=\s*'([^']+)'", RegexOptions.IgnoreCase);
        if (!m.Success)
            return null;

        var part = m.Groups[1].Value.Split(',')[0].Trim();
        var space = part.IndexOf(' ');
        if (space > 0)
            part = part[..space];
        return string.IsNullOrWhiteSpace(part) ? null : part.Trim();
    }

    private static bool LooksLikeTrackingPixel(string url)
    {
        var u = url.ToLowerInvariant();
        return u.Contains("1x1", StringComparison.Ordinal)
            || u.Contains("/pixel.gif", StringComparison.Ordinal)
            || u.Contains("spacer.gif", StringComparison.Ordinal)
            || u.Contains("/blank.", StringComparison.Ordinal)
            || u.Contains("transparent.gif", StringComparison.Ordinal);
    }

    private static string? TryNormalizeImageUrl(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return null;

        var url = WebUtility.HtmlDecode(raw.Trim());
        if (url.StartsWith("//", StringComparison.Ordinal))
            url = "https:" + url;

        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            return null;

        return url;
    }

    private static string? TryGetMediaThumbnailUrl(SyndicationItem item)
    {
        foreach (var ext in item.ElementExtensions)
        {
            try
            {
                if (!string.Equals(ext.OuterName, "thumbnail", StringComparison.OrdinalIgnoreCase))
                    continue;

                using var r = ext.GetReader();
                if (r.MoveToContent() != XmlNodeType.Element)
                    continue;

                var url = r.GetAttribute("url") ?? r.GetAttribute("href");
                if (!string.IsNullOrWhiteSpace(url) && Uri.TryCreate(url, UriKind.Absolute, out _))
                    return url;
            }
            catch
            {
                // ignore malformed extension nodes
            }
        }

        return null;
    }
}
