FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

# Copy everything
COPY . .

# Restore dependencies
RUN dotnet restore "./Backend.csproj" --verbosity normal

# Build
RUN dotnet build "./Backend.csproj" \
    --configuration Release \
    --no-restore \
    --verbosity normal \
    -o /app/build

# Publish
RUN dotnet publish "./Backend.csproj" \
    --configuration Release \
    --no-build \
    --verbosity normal \
    -o /app/publish

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Environment variables
ENV ASPNETCORE_URLS=http://+:${PORT}
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Backend.dll"]