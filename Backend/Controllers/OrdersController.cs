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
<<<<<<< HEAD

=======
>>>>>>> 16/05
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
<<<<<<< HEAD
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
=======
                    // Validate user
                    var user = await _context.Users.FindAsync(orderDto.UserId);
                    if (user == null)
                        return NotFound($"User with ID {orderDto.UserId} not found");

                    decimal subtotal = 0;

                    // Validate items and calculate subtotal
                    foreach (var detail in orderDto.OrderDetails)
                    {
                        var item = await _context.ProductItems
                            .Include(pi => pi.Product)
                            .FirstOrDefaultAsync(pi => pi.ItemId == detail.ItemId);

                        if (item == null)
                            throw new Exception($"Item {detail.ItemId} not found");

                        if (item.Status != "in_stock")
                            throw new Exception($"Item {item.SerialNumber} is not available");

                        subtotal += detail.UnitPrice;
                    }

                    // Create order
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
>>>>>>> 16/05
                        Status = "Pending",
                        OrderDate = DateTime.Now
                    };

                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync();

<<<<<<< HEAD
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
=======
                    // Process items
                    foreach (var detail in orderDto.OrderDetails)
                    {
                        var item = await _context.ProductItems
                            .Include(pi => pi.Product)
                            .FirstOrDefaultAsync(pi => pi.ItemId == detail.ItemId);

                        var orderDetail = new OrderDetail
                        {
                            OrderId = order.Id,
                            ItemId = detail.ItemId,
                            Quantity = 1,
                            UnitPrice = detail.UnitPrice,
                            Subtotal = detail.UnitPrice
>>>>>>> 16/05
                        };

                        _context.OrderDetails.Add(orderDetail);

<<<<<<< HEAD
                        // Update product stock
                        product.StockQuantity -= detail.Quantity;
                        product.SoldQuantity += detail.Quantity;
                    }

                    order.TotalAmount = totalAmount;
                    await _context.SaveChangesAsync();

                    // Clear user's cart
=======
                        // Update item status
                        item.Status = "sold";
                        item.PurchaseDate = DateTime.Now;

                        // Update product quantities
                        item.Product.StockQuantity--;
                        item.Product.SoldQuantity++;
                    }

                    // Clear cart
>>>>>>> 16/05
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
<<<<<<< HEAD
=======
                        SubTotal = order.SubTotal,
                        ShippingFee = order.ShippingFee,
>>>>>>> 16/05
                        TotalAmount = order.TotalAmount
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
<<<<<<< HEAD
                    return StatusCode(500, new { Message = $"Internal server error: {ex.Message}" });
=======
                    return StatusCode(500, new { Message = ex.Message });
>>>>>>> 16/05
                }
            });
        }

        [HttpGet("user/{userId}")]
<<<<<<< HEAD
        public async Task<ActionResult<IEnumerable<Order>>> GetUserOrders(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Ok(orders);
=======
        public async Task<ActionResult<IEnumerable<object>>> GetUserOrders(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound($"User with ID {userId} not found");

                var orders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.ProductItem)
                            .ThenInclude(pi => pi.Product)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.ProductItem.Warranties)
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => new
                    {
                        id = o.Id,
                        orderDate = o.OrderDate,
                        status = o.Status ?? "Pending",
                        totalAmount = o.TotalAmount,
                        shippingAddress = o.ShippingAddress ?? "",
                        phoneNumber = o.PhoneNumber ?? "",
                        email = o.User.Email ?? "",
                        shippingFee = o.ShippingFee,
                        subTotal = o.SubTotal,
                        paymentMethod = o.PaymentMethod ?? "cod",
                        province = o.Province ?? "",
                        district = o.District ?? "",
                        ward = o.Ward ?? "",
                        items = o.OrderDetails.Select(od => new
                        {
                            id = od.Id,
                            productName = od.ProductItem.Product.Name ?? "Unknown Product",
                            serialNumber = od.ProductItem.SerialNumber ?? "N/A",
                            unitPrice = od.UnitPrice,
                            subtotal = od.Subtotal,
                            warranty = od.ProductItem.Warranties
                                .OrderByDescending(w => w.StartDate)
                                .Select(w => new
                                {
                                    warrantyId = w.WarrantyId,
                                    status = w.Status,
                                    startDate = w.StartDate.ToString("yyyy-MM-dd"),
                                    endDate = w.EndDate.ToString("yyyy-MM-dd"),
                                    duration = w.Duration,
                                    notes = w.Notes ?? ""
                                })
                                .FirstOrDefault()
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
        public async Task<ActionResult<IEnumerable<object>>> GetAllOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.ProductItem)
                            .ThenInclude(pi => pi.Product)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.ProductItem.Warranties)
                    .Select(o => new
                    {
                        id = o.Id,
                        userId = o.UserId,
                        userName = o.User.Username,
                        userEmail = o.User.Email,
                        phoneNumber = o.PhoneNumber,
                        orderDate = o.OrderDate,
                        status = o.Status,
                        totalAmount = o.TotalAmount,
                        shippingAddress = o.ShippingAddress,
                        orderItems = o.OrderDetails.Select(od => new
                        {
                            id = od.Id,
                            productName = od.ProductItem.Product.Name,
                            serialNumber = od.ProductItem.SerialNumber,
                            price = od.UnitPrice,
                            quantity = od.Quantity,
                            total = od.Subtotal,
                            warranty = od.ProductItem.Warranties
                                .OrderByDescending(w => w.StartDate)
                                .Select(w => new
                                {
                                    warrantyId = w.WarrantyId,
                                    status = w.Status,
                                    startDate = w.StartDate,
                                    endDate = w.EndDate,
                                    duration = w.Duration,
                                    notes = w.Notes
                                })
                                .FirstOrDefault()
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
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var order = await _context.Orders
                        .Include(o => o.OrderDetails)
                            .ThenInclude(od => od.ProductItem)
                                .ThenInclude(pi => pi.Product)
                        .FirstOrDefaultAsync(o => o.Id == id);

                    if (order == null)
                    {
                        return NotFound($"Order with ID {id} not found");
                    }

                    if (string.IsNullOrEmpty(updateDto.Status))
                    {
                        return BadRequest("Status cannot be empty");
                    }

                    // If order is being marked as delivered
                    if (updateDto.Status == "Delivered")
                    {
                        foreach (var detail in order.OrderDetails)
                        {
                            var item = detail.ProductItem;

                            // Create warranty if applicable
                            if (item.Product.WarrantyDuration > 0)
                            {
                                var warranty = new Warranty
                                {
                                    ItemId = item.ItemId,
                                    StartDate = DateTime.Now.Date, // Use only date
                                    Duration = item.Product.WarrantyDuration,
                                    Status = "active",
                                    Notes = $"Warranty started on delivery of order #{order.Id}"
                                };
                                _context.Warranties.Add(warranty);
                            }
                        }
                    }

                    // Update order status
                    order.Status = updateDto.Status;
                    order.StatusNote = updateDto.Note ?? "";
                    order.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new
                    {
                        id = order.Id,
                        status = order.Status,
                        statusNote = order.StatusNote,
                        updatedAt = order.UpdatedAt,
                        message = "Order status updated successfully"
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = ex.Message });
                }
            });
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
                    .Include(od => od.ProductItem)
                        .ThenInclude(pi => pi.Product)
                    .GroupBy(od => new { od.ProductItem.ProductId, od.ProductItem.Product.Name })
                    .Select(g => new
                    {
                        name = g.Key.Name,
                        sales = g.Count(),
                        revenue = g.Sum(od => od.UnitPrice)
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
>>>>>>> 16/05
        }
    }
}
