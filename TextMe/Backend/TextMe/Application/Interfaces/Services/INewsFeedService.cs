using Application.DTOs;

namespace Application.Interfaces.Services;

public interface INewsFeedService
{
    public Task<IReadOnlyList<NewsArticleDTO>> GetArticlesAsync(string category, CancellationToken cancellationToken = default);
}
