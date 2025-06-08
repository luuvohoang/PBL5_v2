using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class OrderStatusUpdateDTO
    {
        [Required]
        public string Status { get; set; }
        public string? Note { get; set; }
    }
}