using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOrderDetailWithProductItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderDetails_ProductItems_ItemId",
                table: "OrderDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductItems_Products_ProductId",
                table: "ProductItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Warranties_ProductItems_ItemId",
                table: "Warranties");

            migrationBuilder.AlterColumn<int>(
                name: "ItemId",
                table: "OrderDetails",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderDetails_ProductItems_ItemId",
                table: "OrderDetails",
                column: "ItemId",
                principalTable: "ProductItems",
                principalColumn: "ItemId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductItems_Products_ProductId",
                table: "ProductItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Warranties_ProductItems_ItemId",
                table: "Warranties",
                column: "ItemId",
                principalTable: "ProductItems",
                principalColumn: "ItemId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderDetails_ProductItems_ItemId",
                table: "OrderDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductItems_Products_ProductId",
                table: "ProductItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Warranties_ProductItems_ItemId",
                table: "Warranties");

            migrationBuilder.AlterColumn<int>(
                name: "ItemId",
                table: "OrderDetails",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderDetails_ProductItems_ItemId",
                table: "OrderDetails",
                column: "ItemId",
                principalTable: "ProductItems",
                principalColumn: "ItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductItems_Products_ProductId",
                table: "ProductItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Warranties_ProductItems_ItemId",
                table: "Warranties",
                column: "ItemId",
                principalTable: "ProductItems",
                principalColumn: "ItemId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
