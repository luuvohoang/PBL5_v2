using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] OrderDTO orderDto)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var user = await _context.Users.FindAsync(orderDto.UserId);
                    if (user == null)
                    {
                        return NotFound($"User with ID {orderDto.UserId} not found");
                    }

                    // Create new order
                    var order = new Order
                    {
                        UserId = orderDto.UserId,
                        ShippingAddress = orderDto.ShippingAddress,
                        PhoneNumber = orderDto.PhoneNumber,
                        PaymentMethod = orderDto.PaymentMethod,
                        Status = "Pending",
                        OrderDate = DateTime.Now
                    };

                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync();

                    decimal totalAmount = 0;

                    // Process each order detail
                    foreach (var detail in orderDto.OrderDetails)
                    {
                        var product = await _context.Products.FindAsync(detail.ProductId);
                        if (product == null)
                        {
                            throw new Exception($"Product {detail.ProductId} not found");
                        }

                        if (product.StockQuantity < detail.Quantity)
                        {
                            throw new Exception($"Insufficient stock for product {product.Name}");
                        }

                        decimal subtotal = detail.Quantity * detail.UnitPrice;
                        totalAmount += subtotal;

                        // Create order detail
                        var orderDetail = new OrderDetail
                        {
                            OrderId = order.Id,
                            ProductId = detail.ProductId,
                            Quantity = detail.Quantity,
                            UnitPrice = detail.UnitPrice,
                            Subtotal = subtotal
                        };

                        _context.OrderDetails.Add(orderDetail);

                        // Update product stock
                        product.StockQuantity -= detail.Quantity;
                        product.SoldQuantity += detail.Quantity;
                    }

                    order.TotalAmount = totalAmount;
                    await _context.SaveChangesAsync();

                    // Clear user's cart
                    var userCart = await _context.Carts
                        .Include(c => c.CartProducts)
                        .FirstOrDefaultAsync(c => c.UserId == orderDto.UserId);

                    if (userCart != null)
                    {
                        _context.CartProducts.RemoveRange(userCart.CartProducts);
                        await _context.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();

                    return Ok(new
                    {
                        Message = "Order created successfully",
                        OrderId = order.Id,
                        TotalAmount = order.TotalAmount
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
                }
            });
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetUserOrders(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Ok(orders);
        }
    }
}
