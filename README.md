# PC Parts Store

<<<<<<< HEAD
Web application for managing PC component sales.
=======
A web application for managing PC parts sales with an integrated AI chatbot assistant.
>>>>>>> origin/08-06

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

### AI Chatbot Assistant Setup
1. Install dependencies:
```bash
npm install langchain @langchain/openai
```

2. Configure environment variables:
Create a `.env` file in the root directory and add:
```
OPENAI_API_KEY=your_openai_api_key
```

## Features
- Product management
- Shopping cart
- User authentication
- Role-based access control
- Sales tracking
- Image management

### AI Chatbot Assistant
- Powered by LangChain and OpenAI's GPT-3.5
- Context-aware conversations about PC parts
- Memory management for maintaining conversation context
- Easy context clearing
- Real-time typing indicators

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


update 5/6/2025
CREATE TABLE ExchangeStatus (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(50) NOT NULL
);

-- Insert exchange statuses
INSERT INTO ExchangeStatus (Name) VALUES 
('Pending'),
('Approved'),
('Rejected'),
('Completed');

-- Create Product Exchange table
CREATE TABLE ProductExchanges (
    ExchangeId INT PRIMARY KEY IDENTITY(1,1),
    OrderDetailId INT NOT NULL,
    OldItemId INT NOT NULL,
    NewItemId INT,
    RequestDate DATETIME DEFAULT GETDATE(),
    StatusId INT NOT NULL,
    ReasonForExchange NVARCHAR(500) NOT NULL,
    ProcessedById INT,
    ProcessedDate DATETIME,
    Notes NVARCHAR(1000),
    CONSTRAINT FK_Exchange_OrderDetail FOREIGN KEY (OrderDetailId) 
        REFERENCES OrderDetails(Id),
    CONSTRAINT FK_Exchange_OldItem FOREIGN KEY (OldItemId) 
        REFERENCES ProductItems(ItemId),
    CONSTRAINT FK_Exchange_NewItem FOREIGN KEY (NewItemId) 
        REFERENCES ProductItems(ItemId),
    CONSTRAINT FK_Exchange_Status FOREIGN KEY (StatusId) 
        REFERENCES ExchangeStatus(Id),
    CONSTRAINT FK_Exchange_Employee FOREIGN KEY (ProcessedById) 
        REFERENCES Employees(Id)
);

-- Add index for better query performance
CREATE INDEX IX_ProductExchanges_Status ON ProductExchanges(StatusId);
CREATE INDEX IX_ProductExchanges_RequestDate ON ProductExchanges(RequestDate);

-- Update ProductItems table status
ALTER TABLE ProductItems 
DROP CONSTRAINT IF EXISTS CHK_ProductItems_Status;

ALTER TABLE ProductItems
ADD CONSTRAINT CHK_ProductItems_Status 
CHECK (Status IN ('in_stock', 'sold', 'pending_exchange', 'under_warranty', 'returned', 'exchanged'));
GO

// hàm kiểm tra và xóa CHK cũ
EXEC sp_helpconstraint 'ProductItems';

  SELECT 
    name, 
    definition 
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID('dbo.ProductItems');

ALTER TABLE ProductItems
DROP CONSTRAINT CK__ProductIt__Statu__01D345B0;

@startuml
left to right direction
skinparam packageStyle rectangle
skinparam linetype ortho
skinparam nodesep 50
skinparam ranksep 40

actor "Khách hàng" as Customer


rectangle "Hệ thống bán linh kiện điện tử" {

  (Đăng ký tài khoản) as UC1
  (Đăng nhập) as UC2
  (Đăng xuất) as UC3
  (Xem sản phẩm) as UC4
  (Tìm kiếm sản phẩm) as UC5
  (Thêm sản phẩm vào giỏ hàng) as UC6
  (Cập nhật giỏ hàng) as UC7
  (Xem giỏ hàng) as UC8
  (Đặt hàng) as UC9
  (Thanh toán) as UC10
  (Thanh toán bằng tiền mặt) as UC11
  (Thanh toán bằng tài khoản ngân hàng) as UC12
  (Xem lịch sử mua hàng) as UC13
  (Xem bảo hành của sản phẩm) as UC16
  (Hủy đơn hàng) as UC20
  (Đổi trả sản phẩm lỗi) as UC22
  (Nhắn tin / Liên hệ hỗ trợ) as UC15

 
  (Quản lý sản phẩm) as UC17
  (Quản lý đơn hàng) as UC18
  (Quản lý người dùng) as UC19
  (Quản lý nhân viên) as UC28
  (Quản lý sản phẩm đổi/trả) as UC26

  (Tư vấn khách hàng) as UC23
  (Xem thống kê doanh thu) as UC25
}
actor "Nhân viên" as Staff
actor "Admin" as Admin
Admin -|> Staff

'--- Các kết nối của Nhân viên ---
Staff --> UC2
Staff --> UC3
Staff --> UC17
Staff --> UC23
Staff --> UC25

'--- Các kết nối của Admin ---
Admin --> UC19
Admin --> UC18
Admin --> UC26
Admin --> UC28

'--- Các kết nối của Khách hàng ---
Customer --> UC1
Customer --> UC2
Customer --> UC3
Customer --> UC4
Customer --> UC5
Customer --> UC6
Customer --> UC8
Customer --> UC9
Customer --> UC13
Customer --> UC15

'--- Các mối quan hệ use case của khách hàng ---
UC9 --> UC10 : <<include>>
UC10 ..> UC11 : <<extend>>
UC10 ..> UC12 : <<extend>>
UC8 ..> UC7 : <<extend>>
UC13 ..> UC16 : <<extend>>
UC13 ..> UC20 : <<extend>>
UC16 ..> UC22 : <<extend>>


@enduml
