namespace Backend.Models.DTOs
{
    public class ExchangeRequestDto
    {
        public int OrderDetailId { get; set; }
        public int OldItemId { get; set; }
        public string ReasonForExchange { get; set; }
    }
}
