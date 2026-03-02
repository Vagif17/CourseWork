namespace HW_4.DTO_s;

public class CreateInvoiceRowRequestDTO
{
    public int InvoiceId { get; set; }
    public string Service { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
}

public class InvoiceRowResponseDTO
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public string Service { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal Sum { get; set; }
}

public class UpdateInvoiceRowRequestDTO
{
    public int InvoiceId { get; set; }
    public string Service { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
}