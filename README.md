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
