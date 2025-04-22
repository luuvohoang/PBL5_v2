namespace Backend.Models
{
    public class CartProduct
    {
        public int CartId { get; set; }
        public Cart Cart { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
        public int Quantity { get; set; }
        public DateTime AddedAt { get; set; }

        public CartProduct()
        {
            AddedAt = DateTime.Now;
        }
    }
}
