namespace Backend.Models.DTOs
{
    public class OrderDTO
    {
        public int UserId { get; set; }
        public string ShippingAddress { get; set; }
        public string PhoneNumber { get; set; }
        public string PaymentMethod { get; set; }
        public string Province { get; set; }
        public string District { get; set; }
        public string Ward { get; set; }
        public string ShippingMethod { get; set; }
        public decimal ShippingFee { get; set; }
        public List<OrderDetailDTO> OrderDetails { get; set; }
    }

    public class OrderDetailDTO
    {
        public int ItemId { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderDetailResponseDTO
    {
        public int Id { get; set; }
        public int ItemId { get; set; }
        public string SerialNumber { get; set; }
        public string ProductName { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
        public int Quantity { get; set; }
    }
}
