using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;
using Backend.Attributes;
using Microsoft.Extensions.Logging;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MessagesController> _logger;
        private readonly IHubContext<ChatHub> _hubContext;

        public MessagesController(
            ApplicationDbContext context,
            ILogger<MessagesController> logger,
            IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
        }

        [HttpGet("conversation/{userId}")]
        public async Task<ActionResult<IEnumerable<MessageDTO>>> GetConversation(int userId)
        {
            try
            {
                string userIdHeader = HttpContext.Request.Headers["UserId"].ToString();
                if (string.IsNullOrEmpty(userIdHeader))
                {
                    return BadRequest(new { message = "UserId header is required" });
                }

                if (!int.TryParse(userIdHeader, out int currentUserId))
                {
                    return BadRequest(new { message = "Invalid UserId format" });
                }

                var messages = await _context.Messages
                    .Include(m => m.Sender)
                    .Include(m => m.Receiver)
                    .Where(m => (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                               (m.SenderId == userId && m.ReceiverId == currentUserId))
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new MessageDTO
                    {
                        Id = m.Id,
                        SenderId = m.SenderId,
                        ReceiverId = m.ReceiverId,
                        Content = m.Content,
                        CreatedAt = m.CreatedAt,
                        IsRead = m.IsRead,
                        SenderName = m.Sender.Username,
                        ReceiverName = m.Receiver.Username
                    })
                    .ToListAsync();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<MessageDTO>> SendMessage([FromBody] CreateMessageDTO messageDto)
        {
            try
            {
                if (messageDto == null)
                {
                    return BadRequest(new { message = "Message data is required" });
                }

                string userIdHeader = HttpContext.Request.Headers["UserId"].ToString();
                if (string.IsNullOrEmpty(userIdHeader))
                {
                    return BadRequest(new { message = "UserId header is required" });
                }

                if (!int.TryParse(userIdHeader, out int senderId))
                {
                    return BadRequest(new { message = "Invalid UserId format" });
                }

                // Log để debug
                _logger.LogInformation($"Received message: SenderId={senderId}, ReceiverId={messageDto.ReceiverId}, Content={messageDto.Content}");

                var message = new Message
                {
                    SenderId = senderId,
                    ReceiverId = messageDto.ReceiverId,
                    Content = messageDto.Content ?? "",
                    CreatedAt = DateTime.Now,
                    IsRead = false
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                // Load the message with related data
                var result = await _context.Messages
                    .Include(m => m.Sender)
                    .Include(m => m.Receiver)
                    .Where(m => m.Id == message.Id)
                    .Select(m => new MessageDTO
                    {
                        Id = m.Id,
                        SenderId = m.SenderId,
                        ReceiverId = m.ReceiverId,
                        Content = m.Content,
                        CreatedAt = m.CreatedAt,
                        IsRead = m.IsRead,
                        SenderName = m.Sender.Username,
                        ReceiverName = m.Receiver.Username
                    })
                    .FirstAsync();

                // Send real-time notification
                await _hubContext.Clients.Group(messageDto.ReceiverId.ToString())
                    .SendAsync("ReceiveMessage", result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending message: {ex.Message}");
                return StatusCode(500, new { error = ex.Message, detail = ex.InnerException?.Message });
            }
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                _logger.LogInformation($"Attempting to mark message {id} as read");

                var message = await _context.Messages
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (message == null)
                {
                    _logger.LogWarning($"Message with ID {id} not found");
                    return NotFound(new { message = $"Message with ID {id} not found" });
                }

                message.IsRead = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Message {id} marked as read successfully");
                return Ok(new { message = "Message marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error marking message as read: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
