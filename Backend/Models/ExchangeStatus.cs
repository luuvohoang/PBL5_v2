using System.Collections.Generic;

namespace Backend.Models
{
    public class ExchangeStatus
    {
        public int Id { get; set; }
        public string Name { get; set; }

        // Navigation property
        public ICollection<ProductExchange> Exchanges { get; set; }
    }
}
