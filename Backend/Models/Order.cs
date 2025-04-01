namespace Backend.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Shipped, Delivered, Cancelled
        public string ShippingAddress { get; set; }
        public string PhoneNumber { get; set; }
        public string PaymentMethod { get; set; }
        public User User { get; set; }
        public ICollection<OrderDetail> OrderDetails { get; set; }

        public Order()
        {
            OrderDate = DateTime.Now;
            OrderDetails = new List<OrderDetail>();
        }
    }
}
