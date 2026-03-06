using Domain;

namespace Application.DTOs;

public class CreateInvoiceRequestDTO
{
    public int CustomerId { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public string? Comment { get; set; }
}


public class InvoiceResponseDTO
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public decimal TotalSum { get; set; }
    public string? Comment { get; set; }
    public InvoiceStatus Status { get; set; }
}


public class UpdateInvoiceRequestDTO
{
    public int CustomerId { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public string? Comment { get; set; }
}

public class InvoiceQueryParams
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? SortDirection { get; set; }
    public string? Sort { get; set; }
    public int? CustomerId { get; set; }


    public void Validate()
    {
        if (Page < 1)
            Page = 1;

        if (PageSize < 1)
            PageSize = 1;

        if (PageSize > 100)
            PageSize = 100;


        if (string.IsNullOrWhiteSpace(SortDirection))
            SortDirection = "asc";

        SortDirection = SortDirection.ToLower();

        if (SortDirection != "asc" && SortDirection != "desc")
            SortDirection = "asc";
    }
}