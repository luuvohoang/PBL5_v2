using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;
using Backend.Attributes;
using System.Security.Claims;
using Backend.Services; // Add this line

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExchangesController : ControllerBase
    {
        private readonly IExchangeService _exchangeService; // Add this line

        public ExchangesController(IExchangeService exchangeService) // Update constructor
        {
            _exchangeService = exchangeService;
        }

        [HttpPost("request")]
        public async Task<ActionResult<ProductExchange>> RequestExchange(ExchangeRequestDto request)
        {
            try
            {
                var exchange = await _exchangeService.CreateExchangeRequest(request);
                return Ok(exchange);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("process")]
        [RoleAuthorization("Admin")]
        public async Task<ActionResult> ProcessExchange([FromBody] ProcessExchangeDto request)
        {
            try
            {
                Console.WriteLine($"Processing exchange request: {System.Text.Json.JsonSerializer.Serialize(request)}");

                if (request == null)
                    return BadRequest("Request body cannot be null");

                if (request.ExchangeId <= 0)
                    return BadRequest("Invalid exchange ID");

                var employeeId = request.ProcessedById;
                if (employeeId <= 0)
                    return BadRequest("Invalid employee ID");

                var exchange = await _exchangeService.ProcessExchange(request.ExchangeId, request, employeeId);

                return Ok(new
                {
                    message = request.IsApproved ? "Exchange request approved" : "Exchange request rejected",
                    exchange = exchange
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing exchange: {ex}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<ProductExchange>>> GetUserExchanges(int userId)
        {
            try
            {
                var exchanges = await _exchangeService.GetUserExchanges(userId);
                return Ok(exchanges);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("pending")]
        [RoleAuthorization("Admin")]
        public async Task<ActionResult<IEnumerable<ProductExchange>>> GetAllPendingExchanges()
        {
            try
            {
                var exchanges = await _exchangeService.GetAllPendingExchanges();
                return Ok(exchanges);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
