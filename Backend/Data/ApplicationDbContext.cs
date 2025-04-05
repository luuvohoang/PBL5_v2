using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<CartProduct> CartProducts { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.SaveChangesFailed));

            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure trigger for Products table
            modelBuilder.Entity<Product>()
                .ToTable(tb => tb.HasTrigger("TR_Products_UpdateStatus"));

            // Configure decimal properties
            modelBuilder.Entity<Employee>()
                .Property(e => e.Salary)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Sale>()
                .Property(s => s.DiscountPercent)
                .HasColumnType("decimal(5,2)");

            // Configure Order decimal properties
            modelBuilder.Entity<Order>()
                .Property(o => o.ShippingFee)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.SubTotal)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasColumnType("decimal(10,2)");

            // Configure OrderDetail decimal properties
            modelBuilder.Entity<OrderDetail>()
                .Property(od => od.Subtotal)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<OrderDetail>()
                .Property(od => od.UnitPrice)
                .HasColumnType("decimal(10,2)");

            // Configure Cart relationships
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId);

            // Remove incorrect relationship and use CartProduct instead
            modelBuilder.Entity<CartProduct>()
                .HasKey(cp => new { cp.CartId, cp.ProductId });

            modelBuilder.Entity<CartProduct>()
                .HasOne(cp => cp.Cart)
                .WithMany(c => c.CartProducts)
                .HasForeignKey(cp => cp.CartId);

            modelBuilder.Entity<CartProduct>()
                .HasOne(cp => cp.Product)
                .WithMany(p => p.CartProducts)
                .HasForeignKey(cp => cp.ProductId);

            // Configure ProductCategory relationships
            modelBuilder.Entity<ProductCategory>()
                .HasKey(pc => new { pc.ProductId, pc.CategoryId });

            modelBuilder.Entity<ProductCategory>()
                .HasOne(pc => pc.Product)
                .WithMany(p => p.ProductCategories)
                .HasForeignKey(pc => pc.ProductId);

            modelBuilder.Entity<ProductCategory>()
                .HasOne(pc => pc.Category)
                .WithMany(c => c.ProductCategories)
                .HasForeignKey(pc => pc.CategoryId);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Sale)
                .WithMany(s => s.Products)
                .HasForeignKey(p => p.SaleId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.User)
                .WithOne()
                .HasForeignKey<Employee>(e => e.UserId);

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Role)
                .WithMany(r => r.Employees)
                .HasForeignKey(e => e.RoleId);

            // Configure User-Employee relationship
            modelBuilder.Entity<User>()
                .HasOne(u => u.Employee)
                .WithOne(e => e.User)
                .HasForeignKey<Employee>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Employee-Role relationship
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Role)
                .WithMany(r => r.Employees)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Message relationships
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Order relationships
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Order)
                .WithMany(o => o.OrderDetails)
                .HasForeignKey(od => od.OrderId);

            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Product)
                .WithMany()
                .HasForeignKey(od => od.ProductId);

            // Seed initial data
            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "AMD Ryzen 7 5800X",
                    Description = "8-core, 16-thread processor",
                    Price = 449.99M,
                    Category = "cpu",
                    StockQuantity = 10,
                    Manufacturer = "AMD",
                    ImageUrl = "/images/5800x.jpg",
                    SaleId = null  // Add this line
                },
                new Product
                {
                    Id = 2,
                    Name = "NVIDIA RTX 3080",
                    Description = "10GB GDDR6X Graphics Card",
                    Price = 699.99M,
                    Category = "gpu",
                    StockQuantity = 5,
                    Manufacturer = "NVIDIA",
                    ImageUrl = "/images/3080.jpg",
                    SaleId = null  // Add this line
                },
                new Product
                {
                    Id = 3,
                    Name = "ASUS ROG Strix B550-F",
                    Description = "AMD AM4 Gaming Motherboard",
                    Price = 189.99M,
                    Category = "motherboard",
                    StockQuantity = 15,
                    Manufacturer = "ASUS",
                    ImageUrl = "/images/b550f.jpg",
                    SaleId = null  // Add this line
                }
            );
        }
    }
}
