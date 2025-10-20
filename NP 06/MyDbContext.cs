using Microsoft.EntityFrameworkCore;

namespace NP_06._HttpListener_With_HTML;

public class MyDbContext : DbContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer("Server=localhost;Database=NP06;Integrated Security=True;Trust Server Certificate=True;");
    }
    
    public DbSet<User> Users { get; set; }
}