namespace HW_4.DTO_s;

public class CreateCustomerRequestDTO
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}


public class CustomerResponseDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
   
}

public class UpdateCustomerRequestDTO
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}


public class CustomerQueryParams
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public string? Search { get; set; }

    public void Validate()
    {
        if (Page < 1)
            Page = 1;

        if (PageSize < 1)
            PageSize = 1;

        if (PageSize > 100)
            PageSize = 100;

    }
}

