using Microsoft.AspNetCore.Identity;

namespace HW_6.Models;

public class User : IdentityUser
{
    public string Name { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public IEnumerable<Customer> Customers { get; set; } = new List<Customer>();

}
