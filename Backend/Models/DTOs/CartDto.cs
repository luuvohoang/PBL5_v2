namespace Backend.Models.DTOs
{
    public class CartDto
    {
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;  // Default to 1 if not specified
    }
}
