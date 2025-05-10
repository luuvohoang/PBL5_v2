using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public enum ProductStatus
    {
        Available,
        OutOfStock,
        Discontinued
    }

    public class Product
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public decimal Price { get; set; }
        
        public string ImageUrl { get; set; } = string.Empty;
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        public int StockQuantity { get; set; }
        
        [Required]
        public string Manufacturer { get; set; } = string.Empty;
        
        public ICollection<ProductCategory> ProductCategories { get; set; }
        public ICollection<CartProduct> CartProducts { get; set; }
        public int? SaleId { get; set; } = null; // Make sure SaleId is nullable
        public Sale? Sale { get; set; }          // Make Sale reference nullable
        public int SoldQuantity { get; set; }
        
        [Required]
        public string Status { get; set; } = "Available";
        
        public int? CreatedById { get; set; }
        public Employee CreatedBy { get; set; }
        public int? UpdatedById { get; set; }
        public Employee UpdatedBy { get; set; }
        public int WarrantyDuration { get; set; } // Duration in months
    }
}
