using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserCart(int userId)
        {
            try
            {
                var cartItems = await _context.CartProducts
                    .Include(cp => cp.Product)
                    .Include(cp => cp.Product.Sale)
                    .Include(cp => cp.Cart)
                    .Where(cp => cp.Cart.UserId == userId)
                    .Select(cp => new
                    {
                        cp.CartId,
                        cp.ProductId,
                        cp.Product.Name,
                        cp.Product.Price,
                        cp.Product.StockQuantity,
                        cp.Product.Status,
                        cp.Product.ImageUrl,
                        cp.Quantity,
                        Total = cp.Product.Sale != null
                            ? (cp.Product.Price * (1 - cp.Product.Sale.DiscountPercent / 100)) * cp.Quantity
                            : cp.Product.Price * cp.Quantity,
                        Sale = cp.Product.Sale != null ? new
                        {
                            cp.Product.Sale.DiscountPercent,
                            cp.Product.Sale.IsActive
                        } : null
                    })
                    .ToListAsync();

                return Ok(cartItems);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("add")]
        public async Task<ActionResult<CartProduct>> AddToCart([FromBody] CartDto request)
        {
            try
            {
                // Find or create cart
                var cart = await _context.Carts
                    .FirstOrDefaultAsync(c => c.UserId == request.UserId);

                if (cart == null)
                {
                    cart = new Cart { UserId = request.UserId };
                    _context.Carts.Add(cart);
                    await _context.SaveChangesAsync();
                }

                // Check if product exists
                var product = await _context.Products.FindAsync(request.ProductId);
                if (product == null)
                    return NotFound("Product not found");

                // Check or update cart product
                var cartProduct = await _context.CartProducts
                    .FirstOrDefaultAsync(cp => cp.CartId == cart.Id && cp.ProductId == request.ProductId);

                if (cartProduct != null)
                {
                    cartProduct.Quantity += request.Quantity;
                }
                else
                {
                    cartProduct = new CartProduct
                    {
                        CartId = cart.Id,
                        ProductId = request.ProductId,
                        Quantity = request.Quantity,
                        AddedAt = DateTime.Now
                    };
                    _context.CartProducts.Add(cartProduct);
                }

                await _context.SaveChangesAsync();

                // Return full cart item details
                var result = await _context.CartProducts
                    .Include(cp => cp.Product)
                    .FirstAsync(cp => cp.CartId == cart.Id && cp.ProductId == request.ProductId);

                return Ok(new
                {
                    cartId = result.CartId,
                    productId = result.ProductId,
                    quantity = result.Quantity,
                    name = result.Product.Name,
                    price = result.Product.Price,
                    imageUrl = result.Product.ImageUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{cartId}")]
        public async Task<IActionResult> UpdateQuantity(int cartId, [FromBody] UpdateCartItemDto request)
        {
            try
            {
                Console.WriteLine($"Updating cart: CartId={cartId}, ProductId={request.ProductId}, Quantity={request.Quantity}");

                var cartProduct = await _context.CartProducts
                    .FirstOrDefaultAsync(cp => cp.CartId == cartId && cp.ProductId == request.ProductId);

                if (cartProduct == null)
                {
                    Console.WriteLine("Cart product not found");
                    return NotFound("Cart product not found");
                }

                Console.WriteLine($"Current quantity: {cartProduct.Quantity}, New quantity: {request.Quantity}");
                cartProduct.Quantity = request.Quantity;
                await _context.SaveChangesAsync();

                Console.WriteLine("Update successful");
                return Ok(new { message = "Quantity updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating quantity: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{cartId}/products/{productId}/quantity")]
        public async Task<IActionResult> UpdateQuantity(int cartId, int productId, [FromBody] int quantity)
        {
            try
            {
                Console.WriteLine($"Request received - CartId: {cartId}, ProductId: {productId}, Quantity: {quantity}");

                var cartProduct = await _context.CartProducts
                    .FirstOrDefaultAsync(cp => cp.CartId == cartId && cp.ProductId == productId);

                if (cartProduct == null)
                {
                    Console.WriteLine("Cart product not found");
                    return NotFound("Cart product not found");
                }

                cartProduct.Quantity = quantity;
                await _context.SaveChangesAsync();

                Console.WriteLine("Update successful");
                return Ok(new { message = "Quantity updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating quantity: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{cartId}/products/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int cartId, int productId)
        {
            var cartProduct = await _context.CartProducts
                .FirstOrDefaultAsync(cp => cp.CartId == cartId && cp.ProductId == productId);

            if (cartProduct == null) return NotFound();

            _context.CartProducts.Remove(cartProduct);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
