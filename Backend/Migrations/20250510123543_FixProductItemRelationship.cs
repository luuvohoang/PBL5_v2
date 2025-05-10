using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class FixProductItemRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductItems_Products_ProductId",
                table: "ProductItems");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductItems_Products_ProductId1",
                table: "ProductItems");

            migrationBuilder.DropIndex(
                name: "IX_ProductItems_ProductId1",
                table: "ProductItems");

            migrationBuilder.DropColumn(
                name: "ProductId1",
                table: "ProductItems");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductItems_Products_ProductId",
                table: "ProductItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductItems_Products_ProductId",
                table: "ProductItems");

            migrationBuilder.AddColumn<int>(
                name: "ProductId1",
                table: "ProductItems",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductItems_ProductId1",
                table: "ProductItems",
                column: "ProductId1");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductItems_Products_ProductId",
                table: "ProductItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductItems_Products_ProductId1",
                table: "ProductItems",
                column: "ProductId1",
                principalTable: "Products",
                principalColumn: "Id");
        }
    }
}
