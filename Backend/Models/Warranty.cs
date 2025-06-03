using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Backend.Models
{
    public class Warranty
    {
        [Key]
        public int WarrantyId { get; set; }

        [Required]
        public int ItemId { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime StartDate { get; set; }

        [Required]
        public int Duration { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        [Column(TypeName = "date")]
        public DateTime EndDate { get; private set; }

        [Required]
        [Column(TypeName = "varchar(20)")]
        public string Status { get; set; }  // active, expired, void

        [Column(TypeName = "text")]
        public string? Notes { get; set; }

        [ForeignKey("ItemId")]
        public virtual ProductItem ProductItem { get; set; }
    }
}