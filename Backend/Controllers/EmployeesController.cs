using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;  // Add this line
using System.Security.Cryptography;
using System.Text;
using Backend.Attributes;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            return await _context.Employees
                .Include(e => e.Role)
                .Include(e => e.User)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _context.Employees
                .Include(e => e.Role)
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null)
            {
                return NotFound();
            }

            return employee;
        }

        [HttpPost]
        [RoleAuthorization("Admin")]
        public async Task<ActionResult<Employee>> CreateEmployee([FromBody] CreateEmployeeDto dto)
        {
            try
            {
                // Kiểm tra input
                if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password) || dto.RoleId <= 0)
                {
                    return BadRequest("Invalid input data");
                }

                // Kiểm tra email đã tồn tại
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                {
                    return BadRequest("Email already exists");
                }

                // Kiểm tra role tồn tại
                var role = await _context.Roles.FindAsync(dto.RoleId);
                if (role == null)
                {
                    return BadRequest("Invalid role");
                }

                // Tạo user mới
                var user = new User
                {
                    Email = dto.Email,
                    Username = dto.Email.Split('@')[0],
                    PasswordHash = HashPassword(dto.Password),
                    CreatedAt = DateTime.Now
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Tạo employee mới
                var employee = new Employee
                {
                    UserId = user.Id,
                    RoleId = dto.RoleId,
                    FirstName = "",
                    LastName = "",
                    PhoneNumber = "",
                    Address = "",
                    HireDate = DateTime.Now,
                    Salary = 0
                };

                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                // Load đầy đủ thông tin để trả về
                var result = await _context.Employees
                    .Include(e => e.Role)
                    .Include(e => e.User)
                    .FirstAsync(e => e.Id == employee.Id);

                return CreatedAtAction(nameof(GetEmployee), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        [HttpPut("{id}")]
        [RoleAuthorization("Admin")]
        public async Task<IActionResult> UpdateEmployee(int id, [FromBody] EmployeeUpdateDto dto)
        {
            try
            {
                var employee = await _context.Employees
                    .Include(e => e.User)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (employee == null)
                {
                    return NotFound($"Employee with ID {id} not found");
                }

                // Update only the allowed properties
                employee.FirstName = dto.FirstName;
                employee.LastName = dto.LastName;
                employee.PhoneNumber = dto.PhoneNumber;
                employee.Address = dto.Address;
                employee.Salary = dto.Salary;

                await _context.SaveChangesAsync();

                // Return updated employee
                var updatedEmployee = await _context.Employees
                    .Include(e => e.Role)
                    .Include(e => e.User)
                    .FirstOrDefaultAsync(e => e.Id == id);

                return Ok(updatedEmployee);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [RoleAuthorization("Admin")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EmployeeExists(int id)
        {
            return _context.Employees.Any(e => e.Id == id);
        }
    }
}
