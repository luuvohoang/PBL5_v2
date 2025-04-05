using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;
using Backend.Attributes;  // Add this line

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetProducts(string? category)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Sale)  // Include Sale information
                    .AsQueryable();

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(p => p.Category == category.ToLower());
                }

                var products = await query.ToListAsync();

                var productDtos = products.Select(product => new ProductDTO
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    ImageUrl = product.ImageUrl,
                    Category = product.Category,
                    StockQuantity = product.StockQuantity,
                    SoldQuantity = product.SoldQuantity,
                    Status = product.Status,  // Thay đổi từ ToString()
                    Manufacturer = product.Manufacturer,
                    CreatedBy = product.CreatedBy == null ? null : new EmployeeDTO
                    {
                        Id = product.CreatedBy.Id,
                        FirstName = product.CreatedBy.FirstName,
                        LastName = product.CreatedBy.LastName
                    },
                    UpdatedBy = product.UpdatedBy == null ? null : new EmployeeDTO
                    {
                        Id = product.UpdatedBy.Id,
                        FirstName = product.UpdatedBy.FirstName,
                        LastName = product.UpdatedBy.LastName
                    },
                    Sale = product.Sale == null ? null : new SaleDTO
                    {
                        Id = product.Sale.Id,
                        Name = product.Sale.Name,
                        DiscountPercent = product.Sale.DiscountPercent,
                        StartDate = product.Sale.StartDate,
                        EndDate = product.Sale.EndDate,
                        IsActive = product.Sale.IsActive
                    }
                }).ToList();

                return Ok(productDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDTO>> GetProduct(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Sale)
                    .Include(p => p.CreatedBy)
                    .Include(p => p.UpdatedBy)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (product == null)
                {
                    return NotFound($"Product with ID {id} not found");
                }

                var productDto = new ProductDTO
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    ImageUrl = product.ImageUrl,
                    Category = product.Category,
                    StockQuantity = product.StockQuantity,
                    SoldQuantity = product.SoldQuantity,
                    Status = product.Status,  // Thay đổi từ ToString()
                    Manufacturer = product.Manufacturer,
                    CreatedBy = product.CreatedBy == null ? null : new EmployeeDTO
                    {
                        Id = product.CreatedBy.Id,
                        FirstName = product.CreatedBy.FirstName,
                        LastName = product.CreatedBy.LastName
                    },
                    UpdatedBy = product.UpdatedBy == null ? null : new EmployeeDTO
                    {
                        Id = product.UpdatedBy.Id,
                        FirstName = product.UpdatedBy.FirstName,
                        LastName = product.UpdatedBy.LastName
                    },
                    Sale = product.Sale == null ? null : new SaleDTO
                    {
                        Id = product.Sale.Id,
                        Name = product.Sale.Name,
                        DiscountPercent = product.Sale.DiscountPercent,
                        StartDate = product.Sale.StartDate,
                        EndDate = product.Sale.EndDate,
                        IsActive = product.Sale.IsActive
                    }
                };

                return productDto;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [RoleAuthorization("Admin", "Manager")]  // Make sure this attribute is using the correct namespace
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.CartProducts)  // Include related cart products
                    .Include(p => p.ProductCategories)  // Include related categories
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (product == null)
                {
                    return NotFound($"Product with ID {id} not found");
                }

                // Remove related cart products
                if (product.CartProducts != null && product.CartProducts.Any())
                {
                    _context.CartProducts.RemoveRange(product.CartProducts);
                }

                // Remove related product categories
                if (product.ProductCategories != null && product.ProductCategories.Any())
                {
                    _context.ProductCategories.RemoveRange(product.ProductCategories);
                }

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Product deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [RoleAuthorization("Admin", "Manager")]
        public async Task<ActionResult<ProductDTO>> UpdateProduct(int id, [FromForm] ProductUpdateDTO dto)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Sale)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (product == null)
                {
                    return NotFound($"Product with ID {id} not found");
                }

                // Update basic product fields
                product.Name = dto.Name;
                product.Description = dto.Description;
                product.Price = dto.Price;
                product.Category = dto.Category;
                product.StockQuantity = dto.StockQuantity;
                product.Manufacturer = dto.Manufacturer;
                product.Status = dto.Status;

                // Handle image upload
                var imageFile = Request.Form.Files.GetFile("imageFile");
                if (imageFile != null)
                {
                    var fileName = Path.GetFileName(imageFile.FileName);
                    var uploadDir = Path.Combine("wwwroot", "images");
                    Directory.CreateDirectory(uploadDir);

                    var filePath = Path.Combine(uploadDir, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await imageFile.CopyToAsync(stream);
                    }

                    product.ImageUrl = $"/images/{fileName}"; // Store with /images/ prefix
                }
                else if (!string.IsNullOrEmpty(dto.ImageUrl))
                {
                    // Keep the original ImageUrl if no new file is uploaded
                    product.ImageUrl = dto.ImageUrl;
                }

                await _context.SaveChangesAsync();

                // Return updated product
                var updatedProduct = await _context.Products
                    .Include(p => p.Sale)
                    .Include(p => p.CreatedBy)
                    .Include(p => p.UpdatedBy)
                    .FirstOrDefaultAsync(p => p.Id == id);

                return Ok(new ProductDTO
                {
                    Id = updatedProduct.Id,
                    Name = updatedProduct.Name,
                    Description = updatedProduct.Description,
                    Price = updatedProduct.Price,
                    ImageUrl = updatedProduct.ImageUrl,
                    Category = updatedProduct.Category,
                    StockQuantity = updatedProduct.StockQuantity,
                    Manufacturer = updatedProduct.Manufacturer,
                    Status = updatedProduct.Status,
                    SoldQuantity = updatedProduct.SoldQuantity,
                    CreatedBy = updatedProduct.CreatedBy == null ? null : new EmployeeDTO
                    {
                        Id = updatedProduct.CreatedBy.Id,
                        FirstName = updatedProduct.CreatedBy.FirstName,
                        LastName = updatedProduct.CreatedBy.LastName
                    },
                    UpdatedBy = updatedProduct.UpdatedBy == null ? null : new EmployeeDTO
                    {
                        Id = updatedProduct.UpdatedBy.Id,
                        FirstName = updatedProduct.UpdatedBy.FirstName,
                        LastName = updatedProduct.UpdatedBy.LastName
                    },
                    Sale = updatedProduct.Sale == null ? null : new SaleDTO
                    {
                        Id = updatedProduct.Sale.Id,
                        Name = updatedProduct.Sale.Name,
                        DiscountPercent = updatedProduct.Sale.DiscountPercent,
                        StartDate = updatedProduct.Sale.StartDate,
                        EndDate = updatedProduct.Sale.EndDate,
                        IsActive = updatedProduct.Sale.IsActive
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        [RoleAuthorization("Admin", "Manager")]
        public async Task<ActionResult<ProductDTO>> CreateProduct([FromForm] ProductUpdateDTO dto)
        {
            try
            {
                var product = new Product
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    Price = dto.Price,
                    Category = dto.Category,
                    StockQuantity = dto.StockQuantity,
                    Manufacturer = dto.Manufacturer,
                    Status = dto.Status
                };

                // Handle image upload
                var imageFile = Request.Form.Files.GetFile("imageFile");
                if (imageFile != null)
                {
                    var fileName = Path.GetFileName(imageFile.FileName);
                    var uploadDir = Path.Combine("wwwroot", "images");
                    Directory.CreateDirectory(uploadDir);

                    var filePath = Path.Combine(uploadDir, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await imageFile.CopyToAsync(stream);
                    }

                    product.ImageUrl = $"/images/{fileName}";
                }

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                // Return the created product
                var createdProduct = await _context.Products
                    .Include(p => p.Sale)
                    .Include(p => p.CreatedBy)
                    .Include(p => p.UpdatedBy)
                    .FirstOrDefaultAsync(p => p.Id == product.Id);

                return Ok(new ProductDTO
                {
                    Id = createdProduct.Id,
                    Name = createdProduct.Name,
                    Description = createdProduct.Description,
                    Price = createdProduct.Price,
                    ImageUrl = createdProduct.ImageUrl,
                    Category = createdProduct.Category,
                    StockQuantity = createdProduct.StockQuantity,
                    Manufacturer = createdProduct.Manufacturer,
                    Status = createdProduct.Status,
                    SoldQuantity = createdProduct.SoldQuantity,
                    CreatedBy = createdProduct.CreatedBy == null ? null : new EmployeeDTO
                    {
                        Id = createdProduct.CreatedBy.Id,
                        FirstName = createdProduct.CreatedBy.FirstName,
                        LastName = createdProduct.CreatedBy.LastName
                    },
                    UpdatedBy = createdProduct.UpdatedBy == null ? null : new EmployeeDTO
                    {
                        Id = createdProduct.UpdatedBy.Id,
                        FirstName = createdProduct.UpdatedBy.FirstName,
                        LastName = createdProduct.UpdatedBy.LastName
                    },
                    Sale = createdProduct.Sale == null ? null : new SaleDTO
                    {
                        Id = createdProduct.Sale.Id,
                        Name = createdProduct.Sale.Name,
                        DiscountPercent = createdProduct.Sale.DiscountPercent,
                        StartDate = createdProduct.Sale.StartDate,
                        EndDate = createdProduct.Sale.EndDate,
                        IsActive = createdProduct.Sale.IsActive
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("test-connection")]
        public async Task<ActionResult<string>> TestConnection()
        {
            try
            {
                // Thử đếm số lượng sản phẩm
                int productCount = await _context.Products.CountAsync();
                return Ok($"Kết nối thành công. Số lượng sản phẩm: {productCount}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi kết nối: {ex.Message}");
            }
        }
    }
}
