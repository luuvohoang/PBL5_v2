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
<<<<<<< HEAD
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetProducts(string? category)
=======
        public async Task<ActionResult<PaginatedResponseDTO<ProductDTO>>> GetProducts(
            string? category,
            int page = 1,
            int pageSize = 4)
>>>>>>> 16/05
        {
            try
            {
                var query = _context.Products
<<<<<<< HEAD
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
=======
                    .Include(p => p.Sale)
                    .Include(p => p.CreatedBy)
                    .Include(p => p.UpdatedBy)
                    .AsQueryable()
                    .Select(product => new ProductDTO
                    {
                        Id = product.Id,
                        Name = product.Name ?? string.Empty,
                        Description = product.Description ?? string.Empty,
                        Price = product.Price,
                        ImageUrl = product.ImageUrl ?? string.Empty,
                        Category = product.Category ?? string.Empty,
                        StockQuantity = product.StockQuantity,
                        SoldQuantity = product.SoldQuantity,
                        Status = product.Status ?? "Available",
                        Manufacturer = product.Manufacturer ?? string.Empty,
                        CreatedBy = product.CreatedBy == null ? null : new EmployeeDTO
                        {
                            Id = product.CreatedBy.Id,
                            FirstName = product.CreatedBy.FirstName ?? string.Empty,
                            LastName = product.CreatedBy.LastName ?? string.Empty
                        },
                        UpdatedBy = product.UpdatedBy == null ? null : new EmployeeDTO
                        {
                            Id = product.UpdatedBy.Id,
                            FirstName = product.UpdatedBy.FirstName ?? string.Empty,
                            LastName = product.UpdatedBy.LastName ?? string.Empty
                        },
                        Sale = product.Sale == null ? null : new SaleDTO
                        {
                            Id = product.Sale.Id,
                            Name = product.Sale.Name ?? string.Empty,
                            DiscountPercent = product.Sale.DiscountPercent,
                            StartDate = product.Sale.StartDate,
                            EndDate = product.Sale.EndDate,
                            IsActive = product.Sale.IsActive
                        }
                    });

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(p => p.Category.ToLower() == category.ToLower());
                }

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                var products = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var response = new PaginatedResponseDTO<ProductDTO>
                {
                    Items = products,
                    TotalItems = totalItems,
                    CurrentPage = page,
                    TotalPages = totalPages,
                    PageSize = pageSize
                };

                return Ok(response);
>>>>>>> 16/05
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
<<<<<<< HEAD
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
=======
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductUpdateDTO dto)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            var result = await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var product = await _context.Products
                        .FirstOrDefaultAsync(p => p.Id == id);

                    if (product == null)
                        return (false, "Product not found", null);

                    // Validate required fields
                    if (string.IsNullOrWhiteSpace(dto.Name) ||
                        string.IsNullOrWhiteSpace(dto.Description) ||
                        string.IsNullOrWhiteSpace(dto.Category) ||
                        string.IsNullOrWhiteSpace(dto.Manufacturer))
                    {
                        return (false, "Required fields cannot be empty", null);
                    }

                    // Update basic product information only
                    product.Name = dto.Name.Trim();
                    product.Description = dto.Description.Trim();
                    product.Price = dto.Price;
                    product.Category = dto.Category.Trim().ToLower();
                    product.Manufacturer = dto.Manufacturer.Trim();
                    product.Status = dto.Status ?? "Available";
                    product.WarrantyDuration = dto.WarrantyDuration;

                    // Handle image upload
                    if (Request.Form.Files.GetFile("ImageFile") is IFormFile imageFile)
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
                    else if (!string.IsNullOrEmpty(dto.ImageUrl))
                    {
                        product.ImageUrl = dto.ImageUrl;
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return (true, "Product updated successfully", product);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return (false, ex.Message, null);
                }
            });

            if (!result.Item1)
                return BadRequest(new { message = result.Item2 });

            var productDto = await GetProductDTO(result.Item3);
            return Ok(productDto);
        }

        // Separate endpoint for managing items
        [HttpPost("{id}/items")]
        [RoleAuthorization("Admin", "Manager")]
        public async Task<IActionResult> AddProductItems(int id, [FromBody] List<string> serialNumbers)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            var result = await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var product = await _context.Products.FindAsync(id);
                    if (product == null)
                        return (false, $"Product with ID {id} not found");

                    foreach (var serial in serialNumbers.Where(s => !string.IsNullOrWhiteSpace(s)))
                    {
                        var newItem = new ProductItem
                        {
                            ProductId = id,
                            SerialNumber = serial.Trim(),
                            Status = "in_stock",
                            ManufactureDate = DateTime.UtcNow
                        };
                        _context.ProductItems.Add(newItem);
                    }

                    await _context.SaveChangesAsync();
                    product.StockQuantity = await _context.ProductItems
                        .CountAsync(pi => pi.ProductId == id && pi.Status == "in_stock");
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return (true, "Product items added successfully");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return (false, ex.Message);
                }
            });

            if (!result.Item1)
                return BadRequest(new { message = result.Item2 });

            return Ok(new { message = result.Item2 });
>>>>>>> 16/05
        }

        [HttpPost]
        [RoleAuthorization("Admin", "Manager")]
        public async Task<ActionResult<ProductDTO>> CreateProduct([FromForm] ProductUpdateDTO dto)
        {
<<<<<<< HEAD
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
=======
            var strategy = _context.Database.CreateExecutionStrategy();
            var result = await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Validate required fields
                    if (string.IsNullOrWhiteSpace(dto.Name) ||
                        string.IsNullOrWhiteSpace(dto.Description) ||
                        string.IsNullOrWhiteSpace(dto.Category) ||
                        string.IsNullOrWhiteSpace(dto.Manufacturer))
                    {
                        return (false, "Required fields cannot be empty", null);
                    }

                    var product = new Product
                    {
                        Name = dto.Name.Trim(),
                        Description = dto.Description.Trim(),
                        Price = dto.Price,
                        Category = dto.Category.Trim().ToLower(),
                        StockQuantity = 0, // Will be updated after adding items
                        Manufacturer = dto.Manufacturer.Trim(),
                        Status = dto.Status ?? "Available",
                        WarrantyDuration = dto.WarrantyDuration,
                        ImageUrl = string.Empty
                    };

                    _context.Products.Add(product);
                    await _context.SaveChangesAsync();

                    // Handle image upload
                    if (Request.Form.Files.GetFile("ImageFile") is IFormFile imageFile)
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

                    // Handle serial numbers
                    var serialNumbers = Request.Form["SerialNumbers"].ToList();
                    if (serialNumbers != null && serialNumbers.Any())
                    {
                        foreach (var serialNumber in serialNumbers.Where(s => !string.IsNullOrWhiteSpace(s)))
                        {
                            var productItem = new ProductItem
                            {
                                ProductId = product.Id,
                                SerialNumber = serialNumber.Trim(),
                                Status = "in_stock",
                                ManufactureDate = DateTime.UtcNow
                            };
                            _context.ProductItems.Add(productItem);
                        }
                        await _context.SaveChangesAsync();

                        // Update stock quantity
                        product.StockQuantity = serialNumbers.Count;
                        await _context.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();
                    return (true, "Product created successfully", product);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return (false, ex.Message, null);
                }
            });

            if (!result.Item1)
                return BadRequest(new { message = result.Item2 });

            var productDto = await GetProductDTO(result.Item3);
            return Ok(productDto);
>>>>>>> 16/05
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
<<<<<<< HEAD
=======

        [HttpGet("{id}/details")]
        public async Task<ActionResult<ProductDetailDTO>> GetProductDetails(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Sale)
                    .Include(p => p.CreatedBy)
                    .Include(p => p.UpdatedBy)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (product == null)
                    return NotFound($"Product with ID {id} not found");

                var items = await _context.ProductItems
                    .Where(pi => pi.ProductId == id)
                    .Select(pi => new ProductItemDTO
                    {
                        ItemId = pi.ItemId,
                        SerialNumber = pi.SerialNumber,
                        Status = pi.Status,
                        ManufactureDate = pi.ManufactureDate,
                        PurchaseDate = pi.PurchaseDate
                    })
                    .ToListAsync();

                var productDetail = new ProductDetailDTO
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    ImageUrl = product.ImageUrl ?? string.Empty,
                    Category = product.Category,
                    StockQuantity = product.StockQuantity,
                    Manufacturer = product.Manufacturer,
                    Status = product.Status,
                    SoldQuantity = product.SoldQuantity,
                    WarrantyDuration = product.WarrantyDuration,
                    Items = items,
                    // ... map other properties
                };

                return Ok(productDetail);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}/items")]
        [RoleAuthorization("Admin", "Manager")]
        public async Task<ActionResult> UpdateProductItems(int id, [FromBody] ProductItemUpdateDTO updateDto)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var product = await _context.Products.FindAsync(id);
                    if (product == null)
                        return NotFound($"Product with ID {id} not found");

                    // Add new serial numbers
                    if (updateDto.AddedSerials != null && updateDto.AddedSerials.Any())
                    {
                        foreach (var serial in updateDto.AddedSerials)
                        {
                            var newItem = new ProductItem
                            {
                                ProductId = id,
                                SerialNumber = serial.Trim(),
                                Status = "in_stock",
                                ManufactureDate = DateTime.UtcNow
                            };
                            _context.ProductItems.Add(newItem);
                        }
                    }

                    // Remove serial numbers
                    if (updateDto.RemovedSerials != null && updateDto.RemovedSerials.Any())
                    {
                        var itemsToRemove = await _context.ProductItems
                            .Where(pi => pi.ProductId == id && updateDto.RemovedSerials.Contains(pi.SerialNumber))
                            .ToListAsync();

                        _context.ProductItems.RemoveRange(itemsToRemove);
                    }

                    // Update existing items
                    if (updateDto.UpdatedItems != null && updateDto.UpdatedItems.Any())
                    {
                        foreach (var updatedItem in updateDto.UpdatedItems)
                        {
                            var item = await _context.ProductItems.FindAsync(updatedItem.ItemId);
                            if (item != null && item.ProductId == id)
                            {
                                item.SerialNumber = updatedItem.SerialNumber;
                                item.Status = updatedItem.Status;
                            }
                        }
                    }

                    // Update product stock quantity
                    var newStockQuantity = await _context.ProductItems
                        .CountAsync(pi => pi.ProductId == id && pi.Status == "in_stock");
                    product.StockQuantity = newStockQuantity;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new
                    {
                        message = "Product items updated successfully",
                        stockQuantity = newStockQuantity
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = ex.Message });
                }
            });
        }

        // Helper method for mapping
        private async Task<ProductDTO> GetProductDTO(Product product)
        {
            return new ProductDTO
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                ImageUrl = product.ImageUrl,
                Category = product.Category,
                StockQuantity = product.StockQuantity,
                Manufacturer = product.Manufacturer,
                Status = product.Status,
                SoldQuantity = product.SoldQuantity,
                // ... map other properties
            };
        }
>>>>>>> 16/05
    }
}
