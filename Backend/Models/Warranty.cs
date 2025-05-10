using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Backend.Models
{
    public class Warranty
    {
        [Key] public int WarrantyId { get; set; }
        [Required] public int ItemId { get; set; }
        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public int Duration { get; set; } // Months

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime EndDate { get; private set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } // active, expired, void

        [ForeignKey("ItemId")]
        public virtual ProductItem ProductItem { get; set; }
    }
}