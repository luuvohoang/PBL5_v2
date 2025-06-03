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
<<<<<<< HEAD
        public User User { get; set; }
        public ICollection<OrderDetail> OrderDetails { get; set; }
=======
        public string Province { get; set; }
        public string District { get; set; }
        public string Ward { get; set; }
        public string ShippingMethod { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal SubTotal { get; set; }
        public User User { get; set; }
        public ICollection<OrderDetail> OrderDetails { get; set; }
        public string? StatusNote { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public virtual Employee? UpdatedBy { get; set; }
>>>>>>> 16/05

        public Order()
        {
            OrderDate = DateTime.Now;
            OrderDetails = new List<OrderDetail>();
        }
    }
}
