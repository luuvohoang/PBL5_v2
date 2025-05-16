namespace Backend.Models
{
    public class Cart
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public User User { get; set; }
        public ICollection<CartProduct> CartProducts { get; set; }

        public Cart()
        {
            CreatedAt = DateTime.Now;
            CartProducts = new List<CartProduct>();
        }
    }
}
