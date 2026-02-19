using HW_4.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace HW_4.DB_s;

public class InvoiceManagerDB : DbContext
{
    public InvoiceManagerDB(DbContextOptions options) : base(options) { }

    public DbSet<Customer> Customers { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceRow> InvoiceRows { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>(
            Customer =>
            {
                Customer.HasKey(c => c.Id);
                Customer.Property(c => c.Name).IsRequired().HasMaxLength(100);
                Customer.Property(c => c.Address).IsRequired().HasMaxLength(200);
                Customer.Property(c => c.PhoneNumber).IsRequired().HasMaxLength(20);
                Customer.Property(c => c.CreatedAt).IsRequired();
                Customer.Property(c => c.IsArchived).IsRequired();
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
    }
}
