using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ExchangeService : IExchangeService
    {
        private readonly ApplicationDbContext _context;

        public ExchangeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProductExchange> CreateExchangeRequest(ExchangeRequestDto request)
        {
            var orderDetail = await _context.OrderDetails
                .Include(od => od.Order)
                .FirstOrDefaultAsync(od => od.Id == request.OrderDetailId);

            if (orderDetail == null)
                throw new ArgumentException("Order detail not found");

            var item = await _context.ProductItems.FindAsync(request.OldItemId);
            if (item == null)
                throw new ArgumentException("Item not found");

            if (item.Status != "sold")
                throw new ArgumentException($"Item is not eligible for exchange. Current status: {item.Status}");

            var exchange = new ProductExchange
            {
                OrderDetailId = request.OrderDetailId,
                OldItemId = request.OldItemId,
                RequestDate = DateTime.Now,
                StatusId = 1, // Pending
                ReasonForExchange = request.ReasonForExchange
            };

            _context.ProductExchanges.Add(exchange);

            // Update item status
            item.Status = "pending_exchange";
            _context.ProductItems.Update(item);

            await _context.SaveChangesAsync();

            return exchange;
        }

        public async Task<ProductExchange> ProcessExchange(int exchangeId, ProcessExchangeDto request, int employeeId)
        {
            try
            {
                // Get exchange without tracking and include only necessary fields
                var exchangeQuery = await _context.ProductExchanges
                    .AsNoTracking()
                    .Select(e => new
                    {
                        e.ExchangeId,
                        e.StatusId,
                        e.OldItemId,
                        e.OrderDetailId,
                        e.RequestDate,
                        e.ReasonForExchange
                    })
                    .FirstOrDefaultAsync(e => e.ExchangeId == exchangeId);

                if (exchangeQuery == null)
                    throw new ArgumentException($"Exchange request not found with ID: {exchangeId}");

                if (exchangeQuery.StatusId != 1)
                    throw new ArgumentException($"Exchange request cannot be processed. Current status: {exchangeQuery.StatusId}");

                // Create new exchange instance
                var exchange = new ProductExchange
                {
                    ExchangeId = exchangeQuery.ExchangeId,
                    OrderDetailId = exchangeQuery.OrderDetailId,
                    OldItemId = exchangeQuery.OldItemId,
                    StatusId = request.IsApproved ? 2 : 3, // 2 for Approved, 3 for Rejected
                    RequestDate = exchangeQuery.RequestDate,
                    ReasonForExchange = exchangeQuery.ReasonForExchange,
                    ProcessedById = employeeId,
                    ProcessedDate = DateTime.Now,
                    Notes = request.Notes ?? string.Empty
                };

                // Handle item statuses
                if (request.IsApproved)
                {
                    if (!request.NewItemId.HasValue)
                        throw new ArgumentException("New item ID is required for approval");

                    // Update old item status
                    await _context.Database.ExecuteSqlInterpolatedAsync(
                        $"UPDATE ProductItems SET Status = 'returned' WHERE ItemId = {exchangeQuery.OldItemId}");

                    // Update new item status and link to exchange
                    await _context.Database.ExecuteSqlInterpolatedAsync(
                        $"UPDATE ProductItems SET Status = 'sold' WHERE ItemId = {request.NewItemId} AND Status = 'in_stock'");

                    // Cập nhật ItemId trong bảng Warranties - chuyển bảo hành sang sản phẩm mới


                    // Thêm code cập nhật ItemId trong OrderDetails
                    await _context.Database.ExecuteSqlInterpolatedAsync(
                        $@"UPDATE OrderDetails 
                           SET ItemId = {request.NewItemId}
                           WHERE Id = {exchangeQuery.OrderDetailId}");

                    await _context.Database.ExecuteSqlInterpolatedAsync(
                        $"UPDATE Warranties SET ItemId = {request.NewItemId} WHERE ItemId = {exchangeQuery.OldItemId}");

                    var affectedRows = await _context.Database.ExecuteSqlInterpolatedAsync(
                        $"UPDATE ProductExchanges SET StatusId = 2, NewItemId = {request.NewItemId}, ProcessedById = {employeeId}, ProcessedDate = {DateTime.Now}, Notes = {request.Notes ?? string.Empty} WHERE ExchangeId = {exchangeId}");

                    if (affectedRows == 0)
                        throw new Exception("Failed to update exchange request");
                }
                else
                {
                    // Update old item status and reject exchange
                    await _context.Database.ExecuteSqlInterpolatedAsync(
                        $"UPDATE ProductItems SET Status = 'sold' WHERE ItemId = {exchangeQuery.OldItemId}");

                    await _context.Database.ExecuteSqlInterpolatedAsync(
                        $"UPDATE ProductExchanges SET StatusId = 3, ProcessedById = {employeeId}, ProcessedDate = {DateTime.Now}, Notes = {request.Notes ?? string.Empty} WHERE ExchangeId = {exchangeId}");
                }

                // Get updated exchange
                return await _context.ProductExchanges
                    .Include(e => e.Status)
                    .Include(e => e.OldItem)
                    .Include(e => e.NewItem)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.ExchangeId == exchangeId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing exchange: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        private async Task ProcessApprovedExchange(ProductExchange exchange, int? newItemId)
        {
            if (!newItemId.HasValue)
                throw new ArgumentException("New item ID is required for approval");

            var newItem = await _context.ProductItems
                .FirstOrDefaultAsync(i => i.ItemId == newItemId);

            if (newItem == null || newItem.Status != "in_stock")
                throw new ArgumentException("Invalid new item");

            exchange.StatusId = 2; // Approved
            exchange.NewItemId = newItemId;

            exchange.OldItem.Status = "returned";
            newItem.Status = "sold";
        }

        private Task ProcessRejectedExchange(ProductExchange exchange)
        {
            exchange.StatusId = 3; // Rejected
            exchange.OldItem.Status = "sold";
            return Task.CompletedTask;
        }

        public async Task<IEnumerable<ProductExchange>> GetUserExchanges(int userId)
        {
            return await _context.ProductExchanges
                .Include(e => e.Status)
                .Include(e => e.OldItem)
                .Include(e => e.NewItem)
                .Include(e => e.OrderDetail)
                .Where(e => e.OrderDetail.Order.UserId == userId)
                .ToListAsync();
        }

        public async Task<bool> IsEligibleForExchange(int itemId)
        {
            var item = await _context.ProductItems.FindAsync(itemId);
            return item?.Status == "sold";
        }

        public async Task<IEnumerable<ProductExchange>> GetAllPendingExchanges()
        {
            try
            {
                Console.WriteLine("Starting GetAllPendingExchanges");

                // Execute the query with explicit column selection
                var exchanges = await _context.ProductExchanges
                    .AsNoTracking()
                    .Where(e => e.StatusId == 1)
                    .Select(e => new ProductExchange
                    {
                        ExchangeId = e.ExchangeId,
                        OrderDetailId = e.OrderDetailId,
                        OldItemId = e.OldItemId,
                        StatusId = e.StatusId,
                        RequestDate = e.RequestDate,
                        ProcessedDate = e.ProcessedDate,
                        ProcessedById = e.ProcessedById,
                        ReasonForExchange = e.ReasonForExchange ?? string.Empty,
                        Notes = e.Notes ?? string.Empty,
                        Status = new ExchangeStatus
                        {
                            Id = e.Status.Id,
                            Name = e.Status.Name ?? "Unknown"
                        },
                        OldItem = new ProductItem
                        {
                            ItemId = e.OldItem.ItemId,
                            SerialNumber = e.OldItem.SerialNumber ?? "N/A",
                            Status = e.OldItem.Status ?? "unknown",
                            ProductId = e.OldItem.ProductId,
                            Product = new Product
                            {
                                Id = e.OldItem.Product.Id,
                                Name = e.OldItem.Product.Name ?? "Unknown Product",
                                Description = e.OldItem.Product.Description ?? string.Empty
                            }
                        },
                        OrderDetail = new OrderDetail
                        {
                            Id = e.OrderDetail.Id,
                            OrderId = e.OrderDetail.OrderId,
                            ItemId = e.OrderDetail.ItemId,
                            Order = new Order
                            {
                                Id = e.OrderDetail.Order.Id,
                                Status = e.OrderDetail.Order.Status ?? "unknown",
                                OrderDate = e.OrderDetail.Order.OrderDate
                            }
                        }
                    })
                    .OrderByDescending(e => e.RequestDate)
                    .ToListAsync();

                Console.WriteLine($"Successfully retrieved {exchanges.Count} exchanges");
                return exchanges;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllPendingExchanges: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
    }
}
