USE PCPartsStore;
GO

-- Add new columns to Users table if they don't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'PhoneNumber')
BEGIN
    ALTER TABLE Users
    ADD PhoneNumber NVARCHAR(20) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Address')
BEGIN
    ALTER TABLE Users
    ADD Address NVARCHAR(255) NULL;
END

-- Create index for better search performance if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_PhoneNumber')
BEGIN
    CREATE INDEX IX_Users_PhoneNumber ON Users(PhoneNumber);
END
GO
