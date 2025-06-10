using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class ProductExchange
    {
        [Key]
        public int ExchangeId { get; set; }
        public int OrderDetailId { get; set; }
        public int OldItemId { get; set; }
        public int? NewItemId { get; set; }
        public DateTime RequestDate { get; set; }
        public int StatusId { get; set; }
        public string ReasonForExchange { get; set; }
        public int? ProcessedById { get; set; }
        public DateTime? ProcessedDate { get; set; }
        public string Notes { get; set; }

        // Navigation properties
        public OrderDetail OrderDetail { get; set; }
        public ProductItem OldItem { get; set; }
        public ProductItem NewItem { get; set; }
        public ExchangeStatus Status { get; set; }
        public Employee ProcessedBy { get; set; }
    }
}
