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
