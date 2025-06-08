using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class ProductDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string ImageUrl { get; set; }
        public string Category { get; set; }
        public int StockQuantity { get; set; }
        public string Manufacturer { get; set; }
        public SaleDTO Sale { get; set; }
        public int SoldQuantity { get; set; }
        public string Status { get; set; }
        public EmployeeDTO CreatedBy { get; set; }
        public EmployeeDTO UpdatedBy { get; set; }
        public int WarrantyDuration { get; set; }
    }

    public class ProductUpdateDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        [Required]
        public string ImageUrl { get; set; } = "/images/default.jpg";
        public string Category { get; set; }
        public int StockQuantity { get; set; }
        public string Manufacturer { get; set; }
        public string Status { get; set; }
        public int WarrantyDuration { get; set; }
    }

    public class ProductDetailDTO : ProductDTO
    {
        public List<ProductItemDTO> Items { get; set; } = new List<ProductItemDTO>();
    }

    public class ProductItemDTO
    {
        public int ItemId { get; set; }
        public string SerialNumber { get; set; }
        public string Status { get; set; }
        public DateTime? ManufactureDate { get; set; }
        public DateTime? PurchaseDate { get; set; }
    }

    public class ProductItemUpdateDTO
    {
        public List<string> AddedSerials { get; set; } = new List<string>();
        public List<string> RemovedSerials { get; set; } = new List<string>();
        public List<ProductItemDTO> UpdatedItems { get; set; } = new List<ProductItemDTO>();
    }

    public class SaleDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal DiscountPercent { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }

    public class EmployeeDTO
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
