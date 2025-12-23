using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TherapyNotes.Core.Interfaces;
using TherapyNotes.Infrastructure.Auth;
using TherapyNotes.Infrastructure.MongoDB;
using TherapyNotes.Infrastructure.Services;
using TherapyNotes.Infrastructure.Storage;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var jwtSecret = builder.Configuration["JWT:Secret"] ?? throw new InvalidOperationException("JWT:Secret is required");
var jwtExpiryHours = int.Parse(builder.Configuration["JWT:ExpiryHours"] ?? "24");
var mongoUri = builder.Configuration["MongoDB:ConnectionString"] ?? throw new InvalidOperationException("MongoDB:ConnectionString is required");
var mongoDbName = builder.Configuration["MongoDB:DatabaseName"] ?? "therapynotes";

// Storage configuration
var storageEndpoint = builder.Configuration["Storage:Endpoint"] ?? throw new InvalidOperationException("Storage:Endpoint is required");
var storageAccessKey = builder.Configuration["Storage:AccessKey"] ?? throw new InvalidOperationException("Storage:AccessKey is required");
var storageSecretKey = builder.Configuration["Storage:SecretKey"] ?? throw new InvalidOperationException("Storage:SecretKey is required");
var storageBucketName = builder.Configuration["Storage:BucketName"] ?? "therapy-notes";
var storageRegion = builder.Configuration["Storage:Region"] ?? "auto";

// Stripe configuration
var stripeSecretKey = builder.Configuration["Stripe:SecretKey"] ?? throw new InvalidOperationException("Stripe:SecretKey is required");
var stripeWebhookSecret = builder.Configuration["Stripe:WebhookSecret"] ?? throw new InvalidOperationException("Stripe:WebhookSecret is required");
var stripeProfessionalPriceId = builder.Configuration["Stripe:ProfessionalPriceId"] ?? throw new InvalidOperationException("Stripe:ProfessionalPriceId is required");
var stripePremiumPriceId = builder.Configuration["Stripe:PremiumPriceId"] ?? throw new InvalidOperationException("Stripe:PremiumPriceId is required");

// Email configuration (optional)
var resendApiKey = builder.Configuration["Resend:ApiKey"];
var fromEmail = builder.Configuration["Resend:FromEmail"] ?? "TherapyNotes <noreply@therapynotes.app>";

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// JWT Authentication
var key = Encoding.UTF8.GetBytes(jwtSecret);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Register MongoDB context
builder.Services.AddSingleton(new MongoDbContext(mongoUri, mongoDbName));

// Register JWT service
builder.Services.AddSingleton<IJwtService>(new JwtService(jwtSecret, jwtExpiryHours));

// Register Storage service
builder.Services.AddSingleton<IStorageService>(
    new S3StorageService(storageEndpoint, storageAccessKey, storageSecretKey, storageBucketName, storageRegion)
);

// Register Stripe service
builder.Services.AddSingleton(
    new TherapyNotes.Infrastructure.Payments.StripePaymentService(stripeSecretKey, stripeWebhookSecret, stripeProfessionalPriceId, stripePremiumPriceId)
);

// Register Email service (optional - only if API key is configured)
if (!string.IsNullOrEmpty(resendApiKey))
{
    builder.Services.AddSingleton(new TherapyNotes.Infrastructure.Email.ResendEmailService(resendApiKey, fromEmail));
}

// Register Report service
builder.Services.AddSingleton<TherapyNotes.Infrastructure.Reports.ReportService>();

// Register application services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.AddScoped<IUsageLimitService, UsageLimitService>();

var app = builder.Build();

// Initialize database (create indexes and seed templates)
var dbContext = app.Services.GetRequiredService<MongoDbContext>();
await dbContext.InitializeAsync();

var templateService = app.Services.CreateScope().ServiceProvider.GetRequiredService<ITemplateService>();
await templateService.SeedSystemTemplatesAsync();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
