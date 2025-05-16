using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddItemIdToCartProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderDetails_ProductItems_ItemId",
                table: "OrderDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderDetails_Products_ProductId",
                table: "OrderDetails");

            migrationBuilder.DropIndex(
                name: "IX_OrderDetails_ProductId",
                table: "OrderDetails");

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "OrderDetails");

            migrationBuilder.AddColumn<int>(
                name: "ProductId1",
                table: "ProductItems",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitPrice",
                table: "OrderDetails",
                type: "decimal(10,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "Subtotal",
                table: "OrderDetails",
                type: "decimal(10,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

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
                name: "IX_ProductItems_ProductId1",
                table: "ProductItems",
                column: "ProductId1");

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

            migrationBuilder.AddForeignKey(
                name: "FK_OrderDetails_ProductItems_ItemId",
                table: "OrderDetails",
                column: "ItemId",
                principalTable: "ProductItems",
                principalColumn: "ItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductItems_Products_ProductId1",
                table: "ProductItems",
                column: "ProductId1",
                principalTable: "Products",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartProducts_ProductItems_ProductItemItemId",
                table: "CartProducts");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderDetails_ProductItems_ItemId",
                table: "OrderDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductItems_Products_ProductId1",
                table: "ProductItems");

            migrationBuilder.DropIndex(
                name: "IX_ProductItems_ProductId1",
                table: "ProductItems");

            migrationBuilder.DropIndex(
                name: "IX_CartProducts_ProductItemItemId",
                table: "CartProducts");

            migrationBuilder.DropColumn(
                name: "ProductId1",
                table: "ProductItems");

            migrationBuilder.DropColumn(
                name: "ItemId",
                table: "CartProducts");

            migrationBuilder.DropColumn(
                name: "ProductItemItemId",
                table: "CartProducts");

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitPrice",
                table: "OrderDetails",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)");

            migrationBuilder.AlterColumn<decimal>(
                name: "Subtotal",
                table: "OrderDetails",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)");

            migrationBuilder.AddColumn<int>(
                name: "ProductId",
                table: "OrderDetails",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_ProductId",
                table: "OrderDetails",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderDetails_ProductItems_ItemId",
                table: "OrderDetails",
                column: "ItemId",
                principalTable: "ProductItems",
                principalColumn: "ItemId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderDetails_Products_ProductId",
                table: "OrderDetails",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
