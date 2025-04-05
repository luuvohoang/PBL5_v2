-- Drop database if exists
USE master;
GO

IF EXISTS(SELECT * FROM sys.databases WHERE name = 'PCPartsStore')
BEGIN
    ALTER DATABASE PCPartsStore SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE PCPartsStore;
END
GO

CREATE DATABASE PCPartsStore;
GO

USE PCPartsStore;
GO

-- Drop tables if they exist
IF OBJECT_ID('Carts', 'U') IS NOT NULL DROP TABLE Carts;
IF OBJECT_ID('Products', 'U') IS NOT NULL DROP TABLE Products;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
IF OBJECT_ID('Categories', 'U') IS NOT NULL DROP TABLE Categories;
IF OBJECT_ID('ProductCategories', 'U') IS NOT NULL DROP TABLE ProductCategories;
GO

-- Drop stored procedures if they exist
IF OBJECT_ID('sp_SearchProducts', 'P') IS NOT NULL DROP PROCEDURE sp_SearchProducts;
IF OBJECT_ID('sp_AuthenticateUser', 'P') IS NOT NULL DROP PROCEDURE sp_AuthenticateUser;
GO

-- Drop views if they exist
IF OBJECT_ID('vw_PopularProducts', 'V') IS NOT NULL DROP VIEW vw_PopularProducts;
GO

-- Drop existing tables in correct order
DROP TABLE IF EXISTS CartProducts;
DROP TABLE IF EXISTS Carts;
GO

-- Tạo bảng Products
CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Price DECIMAL(10,2) NOT NULL,
    ImageUrl NVARCHAR(255),
    Category NVARCHAR(50) NOT NULL,
    StockQuantity INT NOT NULL,
    SoldQuantity INT NOT NULL DEFAULT 0,
    Status VARCHAR(20) NOT NULL DEFAULT 'Available',
    Manufacturer NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CreatedById INT NULL,
    UpdatedById INT NULL,
    SaleId INT NULL
);
GO

-- Add check constraint for Status
ALTER TABLE Products
    ADD CONSTRAINT CHK_Products_Status 
    CHECK (Status IN ('Available', 'OutOfStock', 'Discontinued'));
GO

-- Add foreign key constraints for CreatedBy and UpdatedBy (sau khi tạo bảng Employees)
ALTER TABLE Products
    ADD CONSTRAINT FK_Products_CreatedBy 
    FOREIGN KEY (CreatedById) REFERENCES Employees(Id)
    ON DELETE SET NULL;

ALTER TABLE Products
    ADD CONSTRAINT FK_Products_UpdatedBy 
    FOREIGN KEY (UpdatedById) REFERENCES Employees(Id)
    ON DELETE SET NULL;

-- Create indexes for new columns
CREATE INDEX IX_Products_Status ON Products(Status);
CREATE INDEX IX_Products_CreatedById ON Products(CreatedById);
CREATE INDEX IX_Products_UpdatedById ON Products(UpdatedById);
CREATE INDEX IX_Products_SoldQuantity ON Products(SoldQuantity);

-- Update existing products to set default values
UPDATE Products SET
    Status = 'Available',
    SoldQuantity = 0;
GO

-- Tạo bảng Users
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Create Carts table with CreatedAt
CREATE TABLE Carts (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Carts_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

-- Create Categories table
CREATE TABLE Categories (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500)
);
GO

-- Create ProductCategories junction table
CREATE TABLE ProductCategories (
    ProductId INT NOT NULL,
    CategoryId INT NOT NULL,
    PRIMARY KEY (ProductId, CategoryId),
    FOREIGN KEY (ProductId) REFERENCES Products(Id),
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);
GO

-- Create CartProducts with AddedAt
CREATE TABLE CartProducts (
    CartId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    AddedAt DATETIME NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY (CartId, ProductId),
    CONSTRAINT FK_CartProducts_Carts FOREIGN KEY (CartId) REFERENCES Carts(Id),
    CONSTRAINT FK_CartProducts_Products FOREIGN KEY (ProductId) REFERENCES Products(Id)
);
GO

-- Create Sales table
CREATE TABLE Sales (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    DiscountPercent DECIMAL(5,2) NOT NULL,
    StartDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- Add SaleId to Products table
ALTER TABLE Products ADD SaleId INT;
GO

-- Add foreign key constraint
ALTER TABLE Products 
ADD CONSTRAINT FK_Products_Sales 
FOREIGN KEY (SaleId) REFERENCES Sales(Id)
ON DELETE SET NULL;
GO

-- Create index for SaleId
CREATE INDEX IX_Products_SaleId ON Products(SaleId);
GO

-- Create Roles table
CREATE TABLE Roles (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255)
);
GO

-- Create Employees table
CREATE TABLE Employees (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    PhoneNumber NVARCHAR(20),
    Address NVARCHAR(255),
    HireDate DATETIME NOT NULL DEFAULT GETDATE(),
    Salary DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);
GO

-- Insert sample roles
INSERT INTO Roles (Name, Description) VALUES
('Admin', 'Full system access'),
('Manager', 'Department management access'),
('Staff', 'Basic system access');
GO

-- Create index for Employees
CREATE NONCLUSTERED INDEX IX_Employees_UserId ON Employees(UserId);
CREATE NONCLUSTERED INDEX IX_Employees_RoleId ON Employees(RoleId);
GO

-- Thêm dữ liệu mẫu
INSERT INTO Products (Name, Description, Price, ImageUrl, Category, StockQuantity, Manufacturer) VALUES
-- CPU
('AMD Ryzen 7 5800X', N'8-core, 16-thread processor, 3.8GHz-4.7GHz', 449.99, '/images/5800x.jpg', 'cpu', 10, 'AMD'),
('Intel Core i9-12900K', N'16-core, 24-thread processor, 3.2GHz-5.2GHz', 589.99, '/images/12900k.jpg', 'cpu', 8, 'Intel'),
('AMD Ryzen 5 5600X', N'6-core, 12-thread processor, 3.7GHz-4.6GHz', 299.99, '/images/5600x.jpg', 'cpu', 15, 'AMD'),

-- GPU
('NVIDIA RTX 3080', N'10GB GDDR6X Graphics Card', 699.99, '/images/3080.jpg', 'gpu', 5, 'NVIDIA'),
('AMD RX 6800 XT', N'16GB GDDR6 Graphics Card', 649.99, '/images/6800xt.jpg', 'gpu', 7, 'AMD'),
('NVIDIA RTX 3070', N'8GB GDDR6 Graphics Card', 499.99, '/images/3070.jpg', 'gpu', 12, 'NVIDIA'),

-- Motherboard
('ASUS ROG Strix B550-F', N'AMD AM4 Gaming Motherboard', 189.99, '/images/b550f.jpg', 'motherboard', 15, 'ASUS'),
('MSI MPG B560', N'Intel LGA 1200 Gaming Motherboard', 169.99, '/images/mpgb560.jpg', 'motherboard', 20, 'MSI'),
('Gigabyte X570 AORUS', N'AMD AM4 Premium Motherboard', 249.99, '/images/x570.jpg', 'motherboard', 8, 'Gigabyte'),

-- RAM
('Corsair Vengeance LPX 32GB', N'DDR4 3600MHz (2x16GB)', 159.99, '/images/corsair-ram.jpg', 'ram', 20, 'Corsair'),
('G.SKILL Ripjaws V 16GB', N'DDR4 3200MHz (2x8GB)', 89.99, '/images/gskill-ram.jpg', 'ram', 25, 'G.SKILL'),
('Crucial Ballistix 64GB', N'DDR4 3600MHz (4x16GB)', 299.99, '/images/crucial-ram.jpg', 'ram', 5, 'Crucial');
GO

-- Thêm dữ liệu mẫu cho Users
INSERT INTO Users (Username, Email, PasswordHash) VALUES 
('johndoe', 'john@example.com', 'test123'),
('janedoe', 'jane@example.com', 'test123');
GO

-- Insert admin and employee users
INSERT INTO Users (Username, Email, PasswordHash) VALUES 
('admin', 'admin@example.com', 'admin123'),
('manager1', 'manager1@example.com', 'manager123'),
('staff1', 'staff1@example.com', 'staff123'),
('staff2', 'staff2@example.com', 'staff123');
GO

-- Insert sample employees with roles
INSERT INTO Employees (UserId, RoleId, FirstName, LastName, PhoneNumber, Address, HireDate, Salary) VALUES
-- Admin (assuming UserId = 3 for admin@example.com)
(3, 1, 'John', 'Admin', '0123456789', '123 Admin St', '2023-01-01', 5000.00),
-- Manager (assuming UserId = 4 for manager1@example.com)
(4, 2, 'Jane', 'Manager', '0123456790', '456 Manager Ave', '2023-02-01', 4000.00),
-- Staff members (assuming UserId = 5,6 for staff1@example.com and staff2@example.com)
(5, 3, 'Bob', 'Staff', '0123456791', '789 Staff St', '2023-03-01', 2500.00),
(6, 3, 'Alice', 'Worker', '0123456792', '321 Worker Rd', '2023-03-15', 2500.00);
GO

-- Update existing users with role information (optional)
UPDATE Users 
SET Username = 'admin', PasswordHash = 'admin123'
WHERE Email = 'admin@example.com';

UPDATE Users 
SET Username = 'manager1', PasswordHash = 'manager123'
WHERE Email = 'manager1@example.com';
GO

-- Optional: Add some permissions or additional role descriptions
UPDATE Roles
SET Description = 'Full system access with user management and reporting capabilities'
WHERE Name = 'Admin';

UPDATE Roles
SET Description = 'Department management with employee oversight and inventory control'
WHERE Name = 'Manager';

UPDATE Roles
SET Description = 'Basic system access with sales and inventory viewing permissions'
WHERE Name = 'Staff';
GO

-- Insert sample categories
INSERT INTO Categories (Name, Description) VALUES
('Gaming', 'High-performance components for gaming'),
('Workstation', 'Professional grade hardware'),
('Budget', 'Cost-effective solutions'),
('Enthusiast', 'Top-tier performance components');
GO

-- Link products to categories
INSERT INTO ProductCategories (ProductId, CategoryId) VALUES
(1, 1), (1, 4), -- AMD Ryzen 7 5800X
(2, 1), (2, 4), -- Intel Core i9
(3, 1), (3, 3), -- AMD Ryzen 5
(4, 1), (4, 4), -- RTX 3080
(5, 1), (5, 4), -- RX 6800 XT
(6, 1), (6, 3); -- RTX 3070
GO

-- Insert sample sale data
INSERT INTO Sales (Name, DiscountPercent, StartDate, EndDate) VALUES
('Summer Sale', 20.00, '2024-06-01', '2024-06-30'),
('Flash Deal', 30.00, '2024-05-01', '2024-05-07');
GO

-- Tạo view cho sản phẩm bán chạy
CREATE VIEW vw_PopularProducts AS
SELECT TOP 10 *
FROM Products
WHERE StockQuantity < 10
ORDER BY StockQuantity ASC;
GO

-- Tạo stored procedure để tìm kiếm sản phẩm
CREATE PROCEDURE sp_SearchProducts
    @SearchTerm NVARCHAR(100),
    @CategoryFilter NVARCHAR(50) = NULL,
    @MinPrice DECIMAL(10,2) = NULL,
    @MaxPrice DECIMAL(10,2) = NULL
AS
BEGIN
    SELECT *
    FROM Products
    WHERE (Name LIKE '%' + @SearchTerm + '%'
        OR Description LIKE '%' + @SearchTerm + '%'
        OR Manufacturer LIKE '%' + @SearchTerm + '%')
        AND (@CategoryFilter IS NULL OR Category = @CategoryFilter)
        AND (@MinPrice IS NULL OR Price >= @MinPrice)
        AND (@MaxPrice IS NULL OR Price <= @MaxPrice)
    ORDER BY Price ASC;
END;
GO

-- Tạo stored procedure để xác thực user
CREATE PROCEDURE sp_AuthenticateUser
    @Email NVARCHAR(100),
    @Password NVARCHAR(255)
AS
BEGIN
    SELECT Id, Username, Email, CreatedAt
    FROM Users
    WHERE Email = @Email AND PasswordHash = @Password;
END;
GO

-- Tạo indexes để tối ưu tìm kiếm
CREATE NONCLUSTERED INDEX IX_Products_Category ON Products(Category);
CREATE NONCLUSTERED INDEX IX_Products_Price ON Products(Price);
CREATE NONCLUSTERED INDEX IX_Products_Manufacturer ON Products(Manufacturer);
GO

-- Tạo index cho Carts (chỉ cần index cho UserId vì bảng Carts không còn ProductId)
CREATE NONCLUSTERED INDEX IX_Carts_UserId ON Carts(UserId);
GO

-- Create index for CartProducts (đã chuyển ProductId sang bảng CartProducts)
CREATE NONCLUSTERED INDEX IX_CartProducts_CartId ON CartProducts(CartId);
CREATE NONCLUSTERED INDEX IX_CartProducts_ProductId ON CartProducts(ProductId);
GO

-- Query mẫu để test
-- Tìm sản phẩm theo từ khóa và khoảng giá
EXEC sp_SearchProducts @SearchTerm = 'AMD', @MinPrice = 200, @MaxPrice = 500;

-- Xem các sản phẩm sắp hết hàng
SELECT * FROM vw_PopularProducts;

-- Xem sản phẩm theo danh mục
SELECT * FROM Products WHERE Category = 'gpu' ORDER BY Price DESC;

-- Thống kê số lượng sản phẩm theo danh mục
SELECT Category, COUNT(*) as ProductCount, AVG(Price) as AvgPrice
FROM Products
GROUP BY Category
ORDER BY ProductCount DESC;
