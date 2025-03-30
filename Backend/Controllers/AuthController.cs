using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;
using Microsoft.Extensions.Logging;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(ApplicationDbContext context, ILogger<AuthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(RegisterDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("Email already registered");
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { user.Id, user.Username, user.Email });
        }

        [HttpPost("login")]
        public async Task<ActionResult<object>> Login(LoginDto request)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Employee)
                    .ThenInclude(e => e.Role)
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    _logger.LogWarning($"Login attempt failed: User not found for email {request.Email}");
                    return Unauthorized("Invalid credentials");
                }

                var hashedPassword = HashPassword(request.Password);
                if (hashedPassword != user.PasswordHash)
                {
                    _logger.LogWarning($"Login attempt failed: Invalid password for email {request.Email}");
                    return Unauthorized("Invalid credentials");
                }

                string role = "Customer";
                if (user.Employee?.Role != null)
                {
                    role = user.Employee.Role.Name;
                }

                _logger.LogInformation($"User login successful - Email: {user.Email}, Role: {role}");

                return Ok(new
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = role
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login error: {ex.Message}", ex);
                return StatusCode(500, "An error occurred during login. Please try again later.");
            }
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
