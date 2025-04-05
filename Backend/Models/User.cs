namespace Backend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public virtual Employee? Employee { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
    }
}
