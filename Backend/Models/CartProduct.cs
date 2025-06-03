<<<<<<< HEAD
=======
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

>>>>>>> 16/05
namespace Backend.Models
{
    public class CartProduct
    {
        public int CartId { get; set; }
<<<<<<< HEAD
        public Cart Cart { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
        public int Quantity { get; set; }
        public DateTime AddedAt { get; set; }

        public CartProduct()
        {
            AddedAt = DateTime.Now;
        }
=======
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public DateTime AddedAt { get; set; }

        [ForeignKey("CartId")]
        public virtual Cart Cart { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }
>>>>>>> 16/05
    }
}
