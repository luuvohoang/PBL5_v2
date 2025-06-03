using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;
using Microsoft.Extensions.Logging;
<<<<<<< HEAD
=======
using Backend.Services;
>>>>>>> 16/05

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthController> _logger;
<<<<<<< HEAD

        public AuthController(ApplicationDbContext context, ILogger<AuthController> logger)
        {
            _context = context;
            _logger = logger;
=======
        private readonly IEmailService _emailService;

        public AuthController(
            ApplicationDbContext context, 
            ILogger<AuthController> logger,
            IEmailService emailService)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
>>>>>>> 16/05
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
                    Role = role,
                    PhoneNumber = user.PhoneNumber,
                    Address = user.Address
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login error: {ex.Message}", ex);
                return StatusCode(500, "An error occurred during login. Please try again later.");
            }
        }

<<<<<<< HEAD
=======
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null)
                {
                    return Ok(); // Still return OK to prevent email enumeration
                }

                var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
                user.ResetToken = token;
                user.ResetTokenExpiry = DateTime.UtcNow.AddHours(24);
                
                await _context.SaveChangesAsync();

                // Send password reset email
                var emailSent = await _emailService.SendPasswordResetEmailAsync(user.Email, token);
                
                if (!emailSent)
                {
                    _logger.LogError($"Failed to send password reset email to {user.Email}");
                    return StatusCode(500, "Failed to send password reset email");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Forgot password error: {ex.Message}", ex);
                return StatusCode(500, "An error occurred. Please try again later.");
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => 
                    u.ResetToken == request.Token && 
                    u.ResetTokenExpiry > DateTime.UtcNow);

                if (user == null)
                {
                    return BadRequest("Invalid or expired reset token");
                }

                user.PasswordHash = HashPassword(request.NewPassword);
                user.ResetToken = null;
                user.ResetTokenExpiry = null;

                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Reset password error: {ex.Message}", ex);
                return StatusCode(500, "An error occurred. Please try again later.");
            }
        }

>>>>>>> 16/05
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
<<<<<<< HEAD
=======

    public class ForgotPasswordDto
    {
        public string Email { get; set; }
    }

    public class ResetPasswordDto
    {
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
>>>>>>> 16/05
}
