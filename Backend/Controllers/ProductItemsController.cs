using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;
using Backend.Attributes;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/productitems")] // Changed route
    public class ProductItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductItemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProductItemDTO>>> GetItems(int productId)
        {
            var items = await _context.ProductItems
                .Where(pi => pi.ProductId == productId)
                .Select(pi => new ProductItemDTO
                {
                    ItemId = pi.ItemId,
                    SerialNumber = pi.SerialNumber,
                    Status = pi.Status,
                    ManufactureDate = pi.ManufactureDate,
                    PurchaseDate = pi.PurchaseDate
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("available/{productId}/{quantity}")]
        public async Task<ActionResult<List<ProductItemDTO>>> GetAvailableItems(int productId, int quantity)
        {
            try
            {
                var availableItems = await _context.ProductItems
                    .Where(pi => pi.ProductId == productId && pi.Status == "in_stock")
                    .Take(quantity)
                    .Select(pi => new ProductItemDTO
                    {
                        ItemId = pi.ItemId,
                        SerialNumber = pi.SerialNumber,
                        Status = pi.Status,
                        ManufactureDate = pi.ManufactureDate,
                        PurchaseDate = pi.PurchaseDate
                    })
                    .ToListAsync();

                if (availableItems.Count < quantity)
                {
                    return BadRequest($"Only {availableItems.Count} items available");
                }

                return Ok(availableItems);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{itemId}/product")]
        public async Task<ActionResult> GetItemProduct(int? itemId)
        {
            try
            {
                if (!itemId.HasValue)
                    return BadRequest("ItemId is required");

                var item = await _context.ProductItems
                    .Include(pi => pi.Product)
                    .FirstOrDefaultAsync(pi => pi.ItemId == itemId);

                if (item == null)
                    return NotFound($"Item with ID {itemId} not found");

                return Ok(new
                {
                    productId = item.ProductId,
                    name = item.Product.Name,
                    price = item.Product.Price,
                    warrantyDuration = item.Product.WarrantyDuration,
                    serialNumber = item.SerialNumber
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{productId}")]
        [RoleAuthorization("Admin", "Manager")]
        public async Task<IActionResult> UpdateItems(int productId, [FromBody] ProductItemUpdateDTO updateDto)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            var result = await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var product = await _context.Products.FindAsync(productId);
                    if (product == null)
                        return (false, "Product not found", null);

                    // Process added serials
                    if (updateDto.AddedSerials != null)
                    {
                        foreach (var serial in updateDto.AddedSerials.Where(s => !string.IsNullOrEmpty(s)))
                        {
                            // Check if serial number already exists
                            var exists = await _context.ProductItems
                                .AnyAsync(pi => pi.SerialNumber == serial.Trim());

                            if (exists)
                                return (false, $"Serial number {serial} already exists", null);

                            _context.ProductItems.Add(new ProductItem
                            {
                                ProductId = productId,
                                SerialNumber = serial.Trim(),
                                Status = "in_stock",
                                ManufactureDate = DateTime.UtcNow
                            });
                        }
                    }

                    // Process removed serials
                    if (updateDto.RemovedSerials != null)
                    {
                        var itemsToRemove = await _context.ProductItems
                            .Where(pi => pi.ProductId == productId &&
                                   updateDto.RemovedSerials.Contains(pi.SerialNumber))
                            .ToListAsync();

                        _context.ProductItems.RemoveRange(itemsToRemove);
                    }

                    // Process updated items
                    if (updateDto.UpdatedItems != null)
                    {
                        foreach (var item in updateDto.UpdatedItems)
                        {
                            var existingItem = await _context.ProductItems
                                .FirstOrDefaultAsync(pi => pi.ItemId == item.ItemId);

                            if (existingItem != null)
                            {
                                existingItem.SerialNumber = item.SerialNumber;
                                existingItem.Status = item.Status;
                            }
                        }
                    }

                    // Save changes first to ensure all item updates are processed
                    await _context.SaveChangesAsync();

                    // After all updates, check if there are any items left
                    var remainingItems = await _context.ProductItems
                        .Where(pi => pi.ProductId == productId)
                        .CountAsync();

                    if (remainingItems == 0)
                    {
                        // Remove the product if no items left
                        _context.Products.Remove(product);
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return (true, "Product removed as it has no items", null);
                    }

                    // Update product's stock quantity
                    product.StockQuantity = await _context.ProductItems
                        .CountAsync(pi => pi.ProductId == productId && pi.Status == "in_stock");

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return (true, "Items updated successfully", product);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return (false, ex.Message, null);
                }
            });

            if (!result.Item1)
                return BadRequest(new { message = result.Item2 });

            if (result.Item3 == null)
            {
                return Ok(new
                {
                    message = result.Item2,
                    productDeleted = true
                });
            }

            return Ok(new
            {
                message = result.Item2,
                stockQuantity = result.Item3.StockQuantity
            });
        }

        [HttpDelete("{itemId}")]
        [RoleAuthorization("Admin", "Manager")]
        public async Task<IActionResult> DeleteItem(int productId, int itemId)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            var result = await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var item = await _context.ProductItems
                        .FirstOrDefaultAsync(pi => pi.ItemId == itemId && pi.ProductId == productId);

                    if (item == null)
                        return (false, "Item not found", false);

                    _context.ProductItems.Remove(item);
                    await _context.SaveChangesAsync();

                    var product = await _context.Products.FindAsync(productId);
                    if (product != null)
                    {
                        // Check if this was the last item
                        var remainingItems = await _context.ProductItems
                            .Where(pi => pi.ProductId == productId)
                            .CountAsync();

                        if (remainingItems == 0)
                        {
                            _context.Products.Remove(product);
                            await _context.SaveChangesAsync();
                            await transaction.CommitAsync();
                            return (true, "Product removed as it has no items", true);
                        }

                        product.StockQuantity = await _context.ProductItems
                            .CountAsync(pi => pi.ProductId == productId && pi.Status == "in_stock");
                        await _context.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();
                    return (true, "Item deleted successfully", false);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return (false, ex.Message, false);
                }
            });

            if (!result.Item1)
                return BadRequest(new { message = result.Item2 });

            return Ok(new
            {
                message = result.Item2,
                productDeleted = result.Item3
            });
        }
    }
}
