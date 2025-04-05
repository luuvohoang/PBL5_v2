namespace Backend.Models.DTOs
{
    public class MessageDTO
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public string SenderName { get; set; }
        public string ReceiverName { get; set; }
    }

    public class CreateMessageDTO
    {
        public int ReceiverId { get; set; }
        public string Content { get; set; }
    }
}
