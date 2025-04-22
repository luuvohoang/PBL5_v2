using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCart(int userId)
        {
            var cartItems = await _context.CartProducts
                .Include(cp => cp.Product)
                .Where(cp => cp.Cart.UserId == userId)
                .Select(cp => new
                {
                    cartProductId = cp.CartId,
                    productId = cp.ProductId,
                    name = cp.Product.Name,
                    price = cp.Product.Price,
                    imageUrl = cp.Product.ImageUrl,
                    quantity = cp.Quantity
                })
                .ToListAsync();

            return Ok(cartItems);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] CartProductDto request)
        {
            try
            {
                var cart = await _context.Carts
                    .FirstOrDefaultAsync(c => c.UserId == request.UserId);

                if (cart == null)
                {
                    cart = new Cart { UserId = request.UserId };
                    _context.Carts.Add(cart);
                    await _context.SaveChangesAsync();
                }

                var existingCartProduct = await _context.CartProducts
                    .FirstOrDefaultAsync(cp => cp.CartId == cart.Id && cp.ProductId == request.ProductId);

                if (existingCartProduct != null)
                {
                    existingCartProduct.Quantity += request.Quantity;
                }
                else
                {
                    var cartProduct = new CartProduct
                    {
                        CartId = cart.Id,
                        ProductId = request.ProductId,
                        Quantity = request.Quantity
                    };
                    _context.CartProducts.Add(cartProduct);
                }

                await _context.SaveChangesAsync();
                return Ok(new { Message = "Product added to cart successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{cartId}/products/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int cartId, int productId)
        {
            var cartProduct = await _context.CartProducts
                .FirstOrDefaultAsync(cp => cp.CartId == cartId && cp.ProductId == productId);

            if (cartProduct == null)
            {
                return NotFound("Product not found in cart");
            }

            _context.CartProducts.Remove(cartProduct);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{cartProductId}")]
        public async Task<IActionResult> RemoveFromCart(int cartProductId)
        {
            var cartProduct = await _context.CartProducts.FindAsync(cartProductId);

            if (cartProduct == null)
            {
                return NotFound("Cart product not found");
            }

            _context.CartProducts.Remove(cartProduct);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
