using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TextMe.Migrations
{
    /// <inheritdoc />
    public partial class MessageClassUpdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Messages_ChatId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "IsMedia",
                table: "Messages");

            migrationBuilder.RenameColumn(
                name: "Data",
                table: "Messages",
                newName: "Text");

            migrationBuilder.AddColumn<string>(
                name: "MediaType",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MediaUrl",
                table: "Messages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Messages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ChatId_CreatedAt",
                table: "Messages",
                columns: new[] { "ChatId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Messages_ChatId_CreatedAt",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "MediaType",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "MediaUrl",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Messages");

            migrationBuilder.RenameColumn(
                name: "Text",
                table: "Messages",
                newName: "Data");

            migrationBuilder.AddColumn<bool>(
                name: "IsMedia",
                table: "Messages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ChatId",
                table: "Messages",
                column: "ChatId");
        }
    }
}
