using Microsoft.AspNetCore.Http.HttpResults;
using System.Collections.Generic;

namespace HW_7.Models;

public class Invoice
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public decimal TotalSum { get; set; }
    public string? Comment { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Created;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public IEnumerable<InvoiceRow> InvoiceRows { get; set; } = new List<InvoiceRow>();

    public bool IsArchived { get; set; } = false;
}


public enum InvoiceStatus
{
    Created,
    Sent,
    Received,
    Paid,
    Cancelled,
    Rejected
}
