using Application.DTOs;
using Application.Interfaces.Services;
using Infrastructure.Helpers;
using Microsoft.Extensions.Caching.Memory;
using System.ServiceModel.Syndication;
using System.Xml;

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
                var contentHtml = RssParsingHelper.GetItemBodyHtml(item);
                var summary = RssParsingHelper.PlainText(summaryHtml);
                
                var image = item.Links.FirstOrDefault(l =>
                    string.Equals(l.RelationshipType, "enclosure", StringComparison.OrdinalIgnoreCase)
                    && l.MediaType != null
                    && l.MediaType.StartsWith("image", StringComparison.OrdinalIgnoreCase))?.Uri?.AbsoluteUri;

                var extXml = RssParsingHelper.GetElementExtensionsFlatXml(item);
                var aggregate = string.Join('\n', summaryHtml, contentHtml, extXml);

                image ??= RssParsingHelper.TryExtractImageFromHtml(aggregate);
                image ??= RssParsingHelper.TryExtractImageFromHtml(summaryHtml);
                image ??= RssParsingHelper.TryExtractImageFromHtml(contentHtml);
                image ??= RssParsingHelper.TryGetMediaThumbnailUrl(item);

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
}
