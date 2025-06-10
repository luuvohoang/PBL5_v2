using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class ProcessExchangeDto
    {
        [Required]
        public int ExchangeId { get; set; }

        [Required]
        public bool IsApproved { get; set; }

        public int? NewItemId { get; set; }

        public string Notes { get; set; } = string.Empty;

        [Required]
        public int ProcessedById { get; set; }
    }
}
