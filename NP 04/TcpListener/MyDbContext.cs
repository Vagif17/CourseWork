using System.Drawing;
using Microsoft.EntityFrameworkCore;

namespace TcpListener;

public class MyDbContext : DbContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer("Server=localhost;Database=NP4;Integrated Security=True;Trust Server Certificate=True;");
    }
    
    public DbSet<Car> Cars { get; set; }
}