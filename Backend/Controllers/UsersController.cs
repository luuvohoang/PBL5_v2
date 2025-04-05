using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPut("{id}/profile")]
        public async Task<ActionResult> UpdateProfile(int id, [FromBody] UserProfileDTO profileDto)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null)
                {
                    return NotFound($"User with ID {id} not found");
                }

                // Cập nhật thông tin
                user.PhoneNumber = profileDto.PhoneNumber;
                user.Address = profileDto.Address;

                await _context.SaveChangesAsync();

                // Refresh dữ liệu từ database
                await _context.Entry(user).ReloadAsync();

                return Ok(new
                {
                    message = "Profile updated successfully",
                    user = new
                    {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email,
                        phoneNumber = user.PhoneNumber,
                        address = user.Address,
                        role = user.Employee?.Role?.Name ?? "Customer"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating profile", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetUserProfile(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                id = user.Id,
                username = user.Username,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                address = user.Address
            });
        }
    }
}
