namespace Backend.Models
{
    public class Sale
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal DiscountPercent { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public ICollection<Product> Products { get; set; }

        public Sale()
        {
            Products = new List<Product>();
        }
    }
}
