using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("ProductItems")]
    public class ProductItem
    {
        [Key]
        public int ItemId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        [StringLength(100)]
        public string SerialNumber { get; set; }

        public DateTime? ManufactureDate { get; set; }

        // Allow null for PurchaseDate and make it clear in the model
        public DateTime? PurchaseDate { get; set; } = null;

        [Required]
        [StringLength(30)]
        public string Status { get; set; } = "in_stock"; // Set default value

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }

        public virtual ICollection<Warranty> Warranties { get; set; }
    }
}