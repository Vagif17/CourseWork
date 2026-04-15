using System.Net;
using System.ServiceModel.Syndication;
using System.Text.RegularExpressions;
using System.Xml;

namespace Infrastructure.Helpers;

public static class RssParsingHelper
{
    public static string PlainText(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return string.Empty;
        var s = Regex.Replace(html, "<.*?>", string.Empty);
        return WebUtility.HtmlDecode(s).Trim();
    }

    public static string? TryExtractImageFromHtml(string? html)
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

    public static string GetItemBodyHtml(SyndicationItem item)
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
            catch { return string.Empty; }
        }
        return string.Empty;
    }

    public static string GetElementExtensionsFlatXml(SyndicationItem item)
    {
        try
        {
            var sb = new System.Text.StringBuilder();
            foreach (var ext in item.ElementExtensions)
            {
                using var r = ext.GetReader();
                sb.AppendLine(r.ReadOuterXml());
            }
            return sb.ToString();
        }
        catch { return string.Empty; }
    }

    public static string? TryGetMediaThumbnailUrl(SyndicationItem item)
    {
        try
        {
            foreach (var ext in item.ElementExtensions)
            {
                var outer = ext.OuterName;
                if (string.Equals(outer, "thumbnail", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(outer, "content", StringComparison.OrdinalIgnoreCase))
                {
                    using var r = ext.GetReader();
                    var url = r.GetAttribute("url");
                    if (!string.IsNullOrWhiteSpace(url) && TryNormalizeImageUrl(url) is { } abs && !LooksLikeTrackingPixel(abs))
                        return abs;
                }
            }
            return null;
        }
        catch { return null; }
    }

    private static string? ExtractAttr(string tag, string attr)
    {
        var m = Regex.Match(tag, $@"\b{attr}\s*=\s*[""']([^""']+)[""']", RegexOptions.IgnoreCase);
        return m.Success ? m.Groups[1].Value : null;
    }

    private static string? FirstSrcsetUrl(string tag)
    {
        var raw = ExtractAttr(tag, "srcset");
        if (string.IsNullOrWhiteSpace(raw))
            return null;
        var first = raw.Split(',').FirstOrDefault()?.Trim().Split(' ').FirstOrDefault();
        return string.IsNullOrWhiteSpace(first) ? null : first;
    }

    private static string? TryNormalizeImageUrl(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return null;
        var s = WebUtility.HtmlDecode(raw).Trim();
        if (s.StartsWith("//"))
            s = "https:" + s;
        if (Uri.TryCreate(s, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            return uri.AbsoluteUri;
        return null;
    }

    private static bool LooksLikeTrackingPixel(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return false;
        var u = url.ToLowerInvariant();
        return u.Contains("/pixel") || u.Contains("/tracking") || u.Contains("/telemetry") || u.Contains("width=1") || u.Contains("height=1");
    }
}
