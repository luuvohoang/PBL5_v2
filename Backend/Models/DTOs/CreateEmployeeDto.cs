namespace Backend.Models.DTOs
{
    public class CreateEmployeeDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public int RoleId { get; set; }
    }
}
