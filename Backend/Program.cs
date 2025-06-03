using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Microsoft.OpenApi.Models;
using Backend.Hubs;
<<<<<<< HEAD
=======
using Backend.Services;
using Backend.Settings;
>>>>>>> 16/05

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    // Add security definition for UserRole header
    c.AddSecurityDefinition("UserRole", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Name = "UserRole",
        Description = "Input your role (Admin/Manager/Staff)"
    });

    // Add security definition for UserId header
    c.AddSecurityDefinition("UserId", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Name = "UserId",
        Description = "Input your user ID"
    });

    // Make sure Swagger UI requires both headers
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "UserRole"
                }
            },
            new string[] {}
        },
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "UserId"
                }
            },
            new string[] {}
        }
    });
});

<<<<<<< HEAD
=======
// Add email configuration
builder.Services.Configure<EmailSettings>(options =>
{
    options.SystemEmail = builder.Configuration["EmailSettings:SystemEmail"] 
        ?? Environment.GetEnvironmentVariable("EMAIL_SYSTEM");
    options.AppPassword = builder.Configuration["EmailSettings:AppPassword"] 
        ?? Environment.GetEnvironmentVariable("EMAIL_PASSWORD");
    options.DisplayName = builder.Configuration["EmailSettings:DisplayName"];
});

>>>>>>> 16/05
// Add DB Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null
            );
        }));

// Update CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();  // Add this line
    });
});

builder.Services.AddSignalR();
<<<<<<< HEAD
=======
builder.Services.AddScoped<IEmailService, EmailService>();
>>>>>>> 16/05

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.UseAuthorization();

app.UseRouting();
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<ChatHub>("/chatHub");
});

// Add error handling middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { error = ex.Message });
    }
});

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
AppContext.SetSwitch("Microsoft.Data.SqlClient.AcceptTrustServerCertificate", true);

app.Run();
