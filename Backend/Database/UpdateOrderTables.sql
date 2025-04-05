USE PCPartsStore;
GO

-- Check if columns exist before adding them
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'Province')
BEGIN
    ALTER TABLE Orders ADD Province NVARCHAR(100) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'District')
BEGIN
    ALTER TABLE Orders ADD District NVARCHAR(100) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'Ward')
BEGIN
    ALTER TABLE Orders ADD Ward NVARCHAR(100) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'ShippingMethod')
BEGIN
    ALTER TABLE Orders ADD ShippingMethod VARCHAR(50) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'ShippingFee')
BEGIN
    ALTER TABLE Orders ADD ShippingFee DECIMAL(10,2) NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Orders') AND name = 'SubTotal')
BEGIN
    ALTER TABLE Orders ADD SubTotal DECIMAL(10,2) NULL DEFAULT 0;
END

-- Update existing nullable columns
ALTER TABLE Orders ALTER COLUMN ShippingAddress NVARCHAR(255) NULL;

-- Create index if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Orders_ShippingMethod' AND object_id = OBJECT_ID('Orders'))
BEGIN
    CREATE INDEX IX_Orders_ShippingMethod ON Orders(ShippingMethod);
END
GO
