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

                    decimal subtotal = 0;
                    // Calculate subtotal first
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

                        subtotal += detail.Quantity * detail.UnitPrice;
                    }

                    // Create new order
                    var order = new Order
                    {
                        UserId = orderDto.UserId,
                        ShippingAddress = orderDto.ShippingAddress ?? "",
                        PhoneNumber = orderDto.PhoneNumber ?? "",
                        PaymentMethod = orderDto.PaymentMethod ?? "cod",
                        Province = orderDto.Province ?? "",
                        District = orderDto.District ?? "",
                        Ward = orderDto.Ward ?? "",
                        ShippingMethod = orderDto.ShippingMethod ?? "Standard",
                        ShippingFee = orderDto.ShippingFee,
                        SubTotal = subtotal,
                        TotalAmount = subtotal + orderDto.ShippingFee,
                        Status = "Pending",
                        OrderDate = DateTime.Now
                    };

                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync();

                    // Process order details
                    foreach (var detail in orderDto.OrderDetails)
                    {
                        var product = await _context.Products.FindAsync(detail.ProductId);
                        var orderDetail = new OrderDetail
                        {
                            OrderId = order.Id,
                            ProductId = detail.ProductId,
                            Quantity = detail.Quantity,
                            UnitPrice = detail.UnitPrice,
                            Subtotal = detail.Quantity * detail.UnitPrice
                        };

                        _context.OrderDetails.Add(orderDetail);
                        product.StockQuantity -= detail.Quantity;
                        product.SoldQuantity += detail.Quantity;
                    }

                    await _context.SaveChangesAsync();

                    // Clear cart
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
                        SubTotal = order.SubTotal,
                        ShippingFee = order.ShippingFee,
                        TotalAmount = order.TotalAmount
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { Message = $"Error: {ex.Message}" });
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
