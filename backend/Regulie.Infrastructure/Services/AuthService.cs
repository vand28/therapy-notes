using MongoDB.Driver;
using System.Security.Cryptography;
using Regulie.Core.DTOs;
using Regulie.Core.Interfaces;
using Regulie.Core.Models;
using Regulie.Infrastructure.MongoDB;

namespace Regulie.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly MongoDbContext _dbContext;
    private readonly IJwtService _jwtService;
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IMfaService _mfaService;

    public AuthService(
        MongoDbContext dbContext, 
        IJwtService jwtService,
        IGoogleAuthService googleAuthService,
        IMfaService mfaService)
    {
        _dbContext = dbContext;
        _jwtService = jwtService;
        _googleAuthService = googleAuthService;
        _mfaService = mfaService;
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
        if (user.PasswordHash == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Check if MFA is enabled
        if (user.MfaEnabled)
        {
            // Generate temporary token for MFA verification
            var tempToken = GenerateTempToken();
            return new AuthResponse(tempToken, user.Id, user.Email, user.Name, user.Role, user.SubscriptionTier);
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

    public async Task<OAuthAuthResponse> GoogleLoginAsync(string idToken, string? role)
    {
        var payload = await _googleAuthService.ValidateGoogleTokenAsync(idToken);

        // Find or create user
        var user = await _dbContext.Users
            .Find(u => u.Email == payload.Email || (u.ExternalId == payload.Subject && u.AuthProvider == "google"))
            .FirstOrDefaultAsync();

        if (user == null)
        {
            // Create new user
            user = new User
            {
                Email = payload.Email,
                Name = payload.Name ?? payload.Email,
                Role = role ?? "parent",
                AuthProvider = "google",
                ExternalId = payload.Subject,
                SubscriptionTier = "free",
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Users.InsertOneAsync(user);
        }
        else if (user.AuthProvider == "credentials" && user.ExternalId == null)
        {
            // Link Google account to existing credentials account
            var filter = Builders<User>.Filter.Eq(u => u.Id, user.Id);
            var update = Builders<User>.Update
                .Set(u => u.AuthProvider, "google")
                .Set(u => u.ExternalId, payload.Subject);
            await _dbContext.Users.UpdateOneAsync(filter, update);
        }

        // Check if MFA is enabled
        if (user.MfaEnabled)
        {
            var tempToken = GenerateTempToken();
            return new OAuthAuthResponse("", user.Id, user.Email, user.Name, user.Role, user.SubscriptionTier, true, tempToken);
        }

        // Generate JWT token
        var token = _jwtService.GenerateToken(user);

        return new OAuthAuthResponse(token, user.Id, user.Email, user.Name, user.Role, user.SubscriptionTier, false, null);
    }

    public async Task<MfaSetupResponse> SetupMfaAsync(string userId)
    {
        var user = await GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        if (user.MfaEnabled)
        {
            throw new InvalidOperationException("MFA is already enabled");
        }

        // Generate TOTP secret
        var secret = _mfaService.GenerateSecret();
        var qrCodeUri = _mfaService.GenerateQrCodeUri(user.Email, secret);
        var qrCodeImage = _mfaService.GenerateQrCodeImage(qrCodeUri);

        // Generate backup codes
        var backupCodes = _mfaService.GenerateBackupCodes();
        var hashedBackupCodes = backupCodes.Select(code => _mfaService.HashBackupCode(code)).ToList();

        // Store secret temporarily (will be saved permanently when setup is verified)
        var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
        var update = Builders<User>.Update
            .Set(u => u.MfaSecret, secret)
            .Set(u => u.BackupCodes, hashedBackupCodes);
        await _dbContext.Users.UpdateOneAsync(filter, update);

        return new MfaSetupResponse(secret, qrCodeUri, qrCodeImage, backupCodes);
    }

    public async Task<bool> VerifyMfaSetupAsync(string userId, string code)
    {
        var user = await GetUserByIdAsync(userId);
        if (user == null || user.MfaSecret == null)
        {
            return false;
        }

        // Verify the code
        var isValid = _mfaService.ValidateTotp(user.MfaSecret, code);
        
        if (isValid)
        {
            // Enable MFA
            var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            var update = Builders<User>.Update.Set(u => u.MfaEnabled, true);
            await _dbContext.Users.UpdateOneAsync(filter, update);
        }

        return isValid;
    }

    public async Task<AuthResponse> VerifyMfaAsync(string tempToken, string code, bool isBackupCode)
    {
        // In a real implementation, tempToken would be a JWT with userId claim
        // For simplicity, we'll assume tempToken contains userId directly
        var userId = tempToken; // TODO: Decode JWT to get userId

        var user = await GetUserByIdAsync(userId);
        if (user == null || !user.MfaEnabled || user.MfaSecret == null)
        {
            throw new UnauthorizedAccessException("Invalid MFA verification");
        }

        bool isValid = false;

        if (isBackupCode)
        {
            // Check backup codes
            foreach (var hashedCode in user.BackupCodes)
            {
                if (_mfaService.VerifyBackupCode(code, hashedCode))
                {
                    isValid = true;
                    
                    // Remove used backup code
                    var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
                    var update = Builders<User>.Update.Pull(u => u.BackupCodes, hashedCode);
                    await _dbContext.Users.UpdateOneAsync(filter, update);
                    break;
                }
            }
        }
        else
        {
            // Verify TOTP code
            isValid = _mfaService.ValidateTotp(user.MfaSecret, code);
        }

        if (!isValid)
        {
            throw new UnauthorizedAccessException("Invalid MFA code");
        }

        // Generate JWT token
        var token = _jwtService.GenerateToken(user);

        return new AuthResponse(token, user.Id, user.Email, user.Name, user.Role, user.SubscriptionTier);
    }

    public async Task<bool> DisableMfaAsync(string userId, string password)
    {
        var user = await GetUserByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        // For OAuth users, skip password verification
        if (user.AuthProvider == "credentials" && user.PasswordHash != null)
        {
            // Verify password for credentials users
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid password");
            }
        }

        // Disable MFA
        var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
        var update = Builders<User>.Update
            .Set(u => u.MfaEnabled, false)
            .Set(u => u.MfaSecret, null)
            .Set(u => u.BackupCodes, new List<string>());
        await _dbContext.Users.UpdateOneAsync(filter, update);

        return true;
    }

    private static string GenerateTempToken()
    {
        var bytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }
        return Convert.ToBase64String(bytes);
    }
}

