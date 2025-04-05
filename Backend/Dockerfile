FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["Backend.csproj", "./"]
RUN dotnet restore "Backend.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "Backend.csproj" -c Release -o /app/build
RUN dotnet publish "Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Configure environment variables
ENV ASPNETCORE_URLS=http://+:$PORT
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Backend.dll"]