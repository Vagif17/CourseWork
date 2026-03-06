using Domain;
using Infrastructure.Identities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure.Data;

public class InvoiceManagerDB : IdentityDbContext<Identities.User>
{
    public InvoiceManagerDB(DbContextOptions<InvoiceManagerDB> options) : base(options) { }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceRow> InvoiceRows => Set<InvoiceRow>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>(
            Customer =>
            {
                Customer.HasKey(c => c.Id);
                Customer.Property(c => c.Name).IsRequired().HasMaxLength(100);
                Customer.Property(c => c.Address).IsRequired().HasMaxLength(200);
                Customer.Property(c => c.PhoneNumber).IsRequired().HasMaxLength(20);
                Customer.Property(c => c.CreatedAt).IsRequired();
                Customer.Property(c => c.IsArchived).IsRequired();
                Customer.Property(c => c.UserId).IsRequired();
            }
            );

        modelBuilder.Entity<Invoice>(
            Invoice =>
            {
                Invoice.HasKey(i => i.Id);
                Invoice.Property(i => i.CustomerId).IsRequired();
                Invoice.HasOne(i => i.Customer).WithMany().HasForeignKey(i => i.CustomerId).OnDelete(DeleteBehavior.Cascade);
                Invoice.Property(i => i.StartDate).IsRequired();
                Invoice.Property(i => i.EndDate).IsRequired();
                Invoice.Property(i => i.TotalSum).IsRequired();
                Invoice.Property(i => i.CreatedAt).IsRequired();
                Invoice.Property(i => i.Status).IsRequired();
                Invoice.Property(i => i.IsArchived).IsRequired();
            }
            );

        modelBuilder.Entity<InvoiceRow>(
            InvoiceRow =>             {
                InvoiceRow.HasKey(ir => ir.Id);
                InvoiceRow.Property(ir => ir.InvoiceId).IsRequired();
                InvoiceRow.Property(ir => ir.Service).IsRequired().HasMaxLength(100);
                InvoiceRow.Property(ir => ir.Quantity).IsRequired();
                InvoiceRow.Property(ir => ir.Rate).IsRequired();
                InvoiceRow.Property(ir => ir.Sum).IsRequired();
                InvoiceRow.HasOne(ir => ir.Invoice)
                    .WithMany(i => i.InvoiceRows)
                    .HasForeignKey(ir => ir.InvoiceId)
                    .OnDelete(DeleteBehavior.Cascade);
            }
            );

        modelBuilder.Entity<RefreshToken>(
            refreshToken =>
            {
                refreshToken.HasKey(rt => rt.Id);
                refreshToken.HasIndex(rt => rt.JwtId).IsUnique();
                refreshToken.Property(rt => rt.JwtId)
                    .IsRequired()
                    .HasMaxLength(64);
                refreshToken.Property(rt => rt.UserId)
                    .IsRequired()
                    .HasMaxLength(450);

            }
            );
    }
}
