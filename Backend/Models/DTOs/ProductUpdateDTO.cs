namespace Backend.Models.DTOs
{
    public class ProductUpdateDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }  // Make ImageUrl nullable
        public string Category { get; set; }
        public int StockQuantity { get; set; }
        public string Manufacturer { get; set; }
        public string Status { get; set; }
        public int? SaleId { get; set; }
    }
}
