using Application.DTOs;

namespace Application.Interfaces.Services;

public interface INewsFeedService
{
    Task<IReadOnlyList<NewsArticleDTO>> GetArticlesAsync(string category, CancellationToken cancellationToken = default);
}
