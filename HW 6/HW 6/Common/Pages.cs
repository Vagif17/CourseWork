namespace HW_6.Common;

public class Pages<T>
{
    public IEnumerable<T> Items { get; set; } = new List<T>();
    public  int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages  => Convert.ToInt32(Math.Ceiling(TotalCount / (double)PageSize));
    public bool HaveNextPage => Page < 1;
    public bool HavePrevPage => Page < TotalPages;

    public static Pages<T> Create(
                                       IEnumerable<T> items,
                                       int page,
                                       int pageSize,
                                       int totalCount)
    {
        return new Pages<T>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

}
