<<<<<<< HEAD
=======
using System.ComponentModel.DataAnnotations;

>>>>>>> 16/05
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
<<<<<<< HEAD
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string ImageUrl { get; set; }
        public string Category { get; set; }
        public int StockQuantity { get; set; }
        public string Manufacturer { get; set; }
=======

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

>>>>>>> 16/05
        public ICollection<ProductCategory> ProductCategories { get; set; }
        public ICollection<CartProduct> CartProducts { get; set; }
        public int? SaleId { get; set; } = null; // Make sure SaleId is nullable
        public Sale? Sale { get; set; }          // Make Sale reference nullable
        public int SoldQuantity { get; set; }
<<<<<<< HEAD
        public string Status { get; set; } = "Available";  // Thay đổi từ enum sang string
=======

        [Required]
        public string Status { get; set; } = "Available";

>>>>>>> 16/05
        public int? CreatedById { get; set; }
        public Employee CreatedBy { get; set; }
        public int? UpdatedById { get; set; }
        public Employee UpdatedBy { get; set; }
<<<<<<< HEAD
=======
        public int WarrantyDuration { get; set; } // Duration in months

        // Add virtual collection of ProductItems
        public virtual ICollection<ProductItem> ProductItems { get; set; }
>>>>>>> 16/05
    }
}
