using MongoDB.Driver;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Interfaces;
using TherapyNotes.Core.Models;
using TherapyNotes.Infrastructure.MongoDB;

namespace TherapyNotes.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly MongoDbContext _dbContext;
    private readonly IJwtService _jwtService;

    public AuthService(MongoDbContext dbContext, IJwtService jwtService)
    {
        _dbContext = dbContext;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        var existingUser = await _dbContext.Users
            .Find(u => u.Email == request.Email)
            .FirstOrDefaultAsync();

        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Create user
        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            Name = request.Name,
            Role = request.Role,
            SubscriptionTier = "free",
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.Users.InsertOneAsync(user);

        // Generate JWT token
        var token = _jwtService.GenerateToken(user);

        return new AuthResponse(token, user.Id, user.Email, user.Name, user.Role, user.SubscriptionTier);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // Find user
        var user = await _dbContext.Users
            .Find(u => u.Email == request.Email)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Generate JWT token
        var token = _jwtService.GenerateToken(user);

        return new AuthResponse(token, user.Id, user.Email, user.Name, user.Role, user.SubscriptionTier);
    }

    public async Task<User?> GetUserByIdAsync(string userId)
    {
        return await _dbContext.Users
            .Find(u => u.Id == userId)
            .FirstOrDefaultAsync();
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _dbContext.Users
            .Find(u => u.Email == email)
            .FirstOrDefaultAsync();
    }
}

