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

        [HttpGet("admin/stats")]
        public async Task<ActionResult<OrderStats>> GetOrderStats()
        {
            try
            {
                var stats = await _context.Orders
                    .GroupBy(o => o.Status)
                    .Select(g => new
                    {
                        Status = g.Key,
                        Count = g.Count()
                    })
                    .ToListAsync();

                var result = new OrderStats
                {
                    PendingOrders = stats.FirstOrDefault(s => s.Status == "Pending")?.Count ?? 0,
                    ProcessingOrders = stats.FirstOrDefault(s => s.Status == "Processing")?.Count ?? 0,
                    ShippingOrders = stats.FirstOrDefault(s => s.Status == "Shipping")?.Count ?? 0,
                    DeliveredOrders = stats.FirstOrDefault(s => s.Status == "Delivered")?.Count ?? 0,
                    CancelledOrders = stats.FirstOrDefault(s => s.Status == "Cancelled")?.Count ?? 0
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("admin/all")]
        public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.Product)
                    .Include(o => o.User)
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => new
                    {
                        id = o.Id,
                        userId = o.UserId,
                        userName = o.User.Username,
                        userEmail = o.User.Email,
                        orderDate = o.OrderDate,
                        status = o.Status,
                        totalAmount = o.TotalAmount,
                        shippingAddress = o.ShippingAddress,
                        phoneNumber = o.PhoneNumber,
                        province = o.Province,
                        district = o.District,
                        ward = o.Ward,
                        orderItems = o.OrderDetails.Select(od => new
                        {
                            id = od.Id,
                            productName = od.Product.Name,
                            quantity = od.Quantity,
                            price = od.UnitPrice
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<Order>> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateDTO updateDto)
        {
            try
            {
                // Find order with minimal includes
                var order = await _context.Orders.FindAsync(id);

                if (order == null)
                {
                    return NotFound($"Order with ID {id} not found");
                }

                // Validate status
                if (string.IsNullOrEmpty(updateDto.Status))
                {
                    return BadRequest("Status cannot be empty");
                }

                // Update fields
                order.Status = updateDto.Status;
                order.StatusNote = updateDto.Note ?? "";  // Handle null note
                order.UpdatedAt = DateTime.UtcNow;

                // Mark as modified and save
                _context.Entry(order).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                // Return response
                return Ok(new
                {
                    id = order.Id,
                    status = order.Status,
                    statusNote = order.StatusNote,
                    updatedAt = order.UpdatedAt,
                    message = "Order status updated successfully"
                });
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "Database error occurred while updating order status", details = ex.InnerException?.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating order status", details = ex.Message });
            }
        }

        [HttpGet("admin/dashboard-stats")]
        public async Task<ActionResult> GetDashboardStats()
        {
            try
            {
                var now = DateTime.UtcNow;
                var lastMonth = now.AddMonths(-1);

                // Get current month stats
                var currentMonthOrders = await _context.Orders
                    .Where(o => o.OrderDate.Month == now.Month && o.OrderDate.Year == now.Year)
                    .ToListAsync();

                // Get last month stats
                var lastMonthOrders = await _context.Orders
                    .Where(o => o.OrderDate.Month == lastMonth.Month && o.OrderDate.Year == lastMonth.Year)
                    .ToListAsync();

                var currentMonthRevenue = currentMonthOrders.Sum(o => o.TotalAmount);
                var lastMonthRevenue = lastMonthOrders.Sum(o => o.TotalAmount);

                var stats = new
                {
                    totalRevenue = currentMonthRevenue,
                    totalOrders = currentMonthOrders.Count,
                    averageOrderValue = currentMonthOrders.Any()
                        ? currentMonthRevenue / currentMonthOrders.Count
                        : 0,
                    activeCustomers = await _context.Orders
                        .Where(o => o.OrderDate >= lastMonth)
                        .Select(o => o.UserId)
                        .Distinct()
                        .CountAsync(),
                    revenueChange = lastMonthRevenue > 0
                        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                        : 0,
                    ordersChange = lastMonthOrders.Count > 0
                        ? ((double)(currentMonthOrders.Count - lastMonthOrders.Count) / lastMonthOrders.Count) * 100
                        : 0
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error fetching dashboard stats: {ex.Message}" });
            }
        }

        [HttpGet("admin/revenue/{period}")]
        public async Task<ActionResult> GetRevenueByPeriod(string period)
        {
            try
            {
                var now = DateTime.UtcNow;
                var startDate = period.ToLower() switch
                {
                    "week" => now.AddDays(-7),
                    "month" => now.AddMonths(-1),
                    "year" => now.AddYears(-1),
                    _ => now.AddMonths(-1)
                };

                // Execute query without string formatting
                var revenueData = await _context.Orders
                    .Where(o => o.OrderDate >= startDate && o.Status != "Cancelled")
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new
                    {
                        date = g.Key,  // Keep as DateTime
                        revenue = g.Sum(o => o.TotalAmount),
                        orders = g.Count()
                    })
                    .OrderBy(x => x.date)
                    .ToListAsync();

                // Format dates after getting data from database
                var formattedData = revenueData.Select(x => new
                {
                    date = x.date.ToString("yyyy-MM-dd"),
                    revenue = x.revenue,
                    orders = x.orders
                });

                return Ok(new { data = formattedData });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error fetching revenue data: {ex.Message}" });
            }
        }

        [HttpGet("admin/top-products")]
        public async Task<ActionResult> GetTopProducts()
        {
            try
            {
                var topProducts = await _context.OrderDetails
                    .Include(od => od.Product)
                    .GroupBy(od => new { od.ProductId, od.Product.Name })
                    .Select(g => new
                    {
                        name = g.Key.Name,
                        sales = g.Sum(od => od.Quantity),
                        revenue = g.Sum(od => od.Quantity * od.UnitPrice)
                    })
                    .OrderByDescending(x => x.revenue)
                    .Take(5)
                    .ToListAsync();

                return Ok(topProducts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error fetching top products: {ex.Message}" });
            }
        }
    }
}
