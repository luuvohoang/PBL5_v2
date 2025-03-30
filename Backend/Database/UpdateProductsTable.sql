USE PCPartsStore;
GO

-- 1. Add new columns
ALTER TABLE Products
    ADD SoldQuantity INT NOT NULL DEFAULT 0;
GO

ALTER TABLE Products
    ADD Status VARCHAR(20) NOT NULL DEFAULT 'Available';
GO

ALTER TABLE Products
    ADD CreatedById INT NULL,
    UpdatedById INT NULL;
GO

-- 2. Add check constraint for Status
ALTER TABLE Products
    ADD CONSTRAINT CHK_Products_Status 
    CHECK (Status IN ('Available', 'OutOfStock', 'Discontinued'));
GO

-- 3. Add foreign key constraints with NO ACTION instead of SET NULL
-- Remove existing constraints if they exist
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Products_CreatedBy')
    ALTER TABLE Products DROP CONSTRAINT FK_Products_CreatedBy;
GO;

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Products_UpdatedBy')
    ALTER TABLE Products DROP CONSTRAINT FK_Products_UpdatedBy;
GO

-- Add constraints with NO ACTION;
ALTER TABLE Products
    ADD CONSTRAINT FK_Products_CreatedBy 
    FOREIGN KEY (CreatedById) REFERENCES Employees(Id)
    ON DELETE NO ACTION;
GO

ALTER TABLE Products
    ADD CONSTRAINT FK_Products_UpdatedBy 
    FOREIGN KEY (UpdatedById) REFERENCES Employees(Id)
    ON DELETE NO ACTION;
GO

-- 4. Create indexes for new columns
CREATE INDEX IX_Products_Status ON Products(Status);
GO
CREATE INDEX IX_Products_CreatedById ON Products(CreatedById);
GO
CREATE INDEX IX_Products_UpdatedById ON Products(UpdatedById);
GO
CREATE INDEX IX_Products_SoldQuantity ON Products(SoldQuantity);
GO

-- 5. Update existing products
UPDATE Products SET
    Status = 'Available',
    SoldQuantity = 0,
    CreatedById = (SELECT TOP 1 Id FROM Employees WHERE RoleId = 1), -- Admin
    UpdatedById = (SELECT TOP 1 Id FROM Employees WHERE RoleId = 1); -- Admin
GO

-- 6. Create trigger for auto-updating Status based on StockQuantity
CREATE OR ALTER TRIGGER TR_Products_UpdateStatus
ON Products
AFTER UPDATE
AS
BEGIN
    UPDATE p
    SET Status = CASE 
        WHEN i.StockQuantity > 0 THEN 'Available'
        WHEN i.StockQuantity = 0 THEN 'OutOfStock'
        ELSE p.Status 
    END
    FROM Products p
    INNER JOIN inserted i ON p.Id = i.Id
    WHERE p.Status != 'Discontinued';
END;
GO
