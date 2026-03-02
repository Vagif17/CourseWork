using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HW_4.Migrations
{
    /// <inheritdoc />
    public partial class ArchiveUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Invoices",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Customers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Customers");
        }
    }
}
