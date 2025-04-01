namespace Backend.Models.DTOs
{
    public class EmployeeUpdateDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public decimal Salary { get; set; }
    }
}
