# PC Parts Store

Web application for managing PC component sales.

## Setup

### Prerequisites
- .NET 6.0 or higher
- Node.js 14+ and npm
- SQL Server

### Backend Setup
1. Copy `appsettings.example.json` to `appsettings.json`
2. Update database connection string in `appsettings.json`
3. Run database migrations:
```bash
cd Backend
dotnet ef database update
```

### Frontend Setup
```bash
npm install
npm start
```

## Features
- Product management
- Shopping cart
- User authentication
- Role-based access control
- Sales tracking
- Image management

## Development
- Backend: ASP.NET Core Web API
- Frontend: React
- Database: SQL Server

## Note
Make sure to ignore `appsettings.json` in git as it contains sensitive information. Use `appsettings.example.json` as a template.

update 20/4
thêm các thuộc tính cho order 
ALTER TABLE Orders
ADD StatusNote NVARCHAR(255),
    UpdatedAt DATETIME,
    UpdatedById INT;

- dotnet add package SendGrid
update 1/5
-- Thêm Warranty cho sản phẩm
CREATE TABLE ProductItems (
    ItemId INT PRIMARY KEY IDENTITY(1,1),
    ProductId INT NOT NULL,                             -- Liên kết với bảng Products
    SerialNumber VARCHAR(100) UNIQUE NOT NULL,          -- Ví dụ: A001-1, A001-2
    ManufactureDate DATE,                               -- Ngày sản xuất
    PurchaseDate DATE,                                  -- Ngày bán (khi khách mua)
    Status VARCHAR(30) CHECK (Status IN ('in_stock', 'sold', 'under_warranty', 'returned')),
    CONSTRAINT FK_ProductItems_Products FOREIGN KEY (ProductId)
        REFERENCES Products(Id)
);
ALTER TABLE OrderDetails ADD ItemId INT;

ALTER TABLE OrderDetails
ADD CONSTRAINT FK_OrderDetails_ProductItems FOREIGN KEY (ItemId)
    REFERENCES ProductItems(ItemId);
CREATE TABLE Warranties (
    WarrantyId INT PRIMARY KEY IDENTITY(1,1),
    ItemId INT NOT NULL,                              -- Tham chiếu đến ProductItems
    StartDate DATE NOT NULL,                          -- Ngày bắt đầu bảo hành
    Duration INT NOT NULL,                            -- Thời gian bảo hành (tháng)
    EndDate AS DATEADD(MONTH, Duration, StartDate),   -- Cột tính toán ngày hết hạn
    Status VARCHAR(20) CHECK (Status IN ('active', 'expired', 'void')),
    CONSTRAINT FK_Warranties_ProductItems FOREIGN KEY (ItemId)
        REFERENCES ProductItems(ItemId)
);

ALTER TABLE Products ADD Warranty INT; 


ALTER TABLE Users
ADD ResetToken NVARCHAR(100),
    ResetTokenExpiry DATETIME;

    pass sql azure MyPcParts@SQL!2024
