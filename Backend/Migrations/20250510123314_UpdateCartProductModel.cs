using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCartProductModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartProducts_ProductItems_ProductItemItemId",
                table: "CartProducts");

            migrationBuilder.DropIndex(
                name: "IX_CartProducts_ProductItemItemId",
                table: "CartProducts");

            migrationBuilder.DropColumn(
                name: "ItemId",
                table: "CartProducts");

            migrationBuilder.DropColumn(
                name: "ProductItemItemId",
                table: "CartProducts");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ItemId",
                table: "CartProducts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ProductItemItemId",
                table: "CartProducts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_CartProducts_ProductItemItemId",
                table: "CartProducts",
                column: "ProductItemItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_CartProducts_ProductItems_ProductItemItemId",
                table: "CartProducts",
                column: "ProductItemItemId",
                principalTable: "ProductItems",
                principalColumn: "ItemId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
