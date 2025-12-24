using Google.Apis.Auth;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Models;

namespace TherapyNotes.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<User?> GetUserByIdAsync(string userId);
    Task<User?> GetUserByEmailAsync(string email);
    Task<OAuthAuthResponse> GoogleLoginAsync(string idToken, string? role);
    Task<MfaSetupResponse> SetupMfaAsync(string userId);
    Task<bool> VerifyMfaSetupAsync(string userId, string code);
    Task<AuthResponse> VerifyMfaAsync(string tempToken, string code, bool isBackupCode);
    Task<bool> DisableMfaAsync(string userId, string password);
}

public interface IClientService
{
    Task<ClientResponse> CreateClientAsync(string therapistId, CreateClientRequest request);
    Task<ClientResponse?> GetClientByIdAsync(string clientId, string userId);
    Task<List<ClientResponse>> GetTherapistClientsAsync(string therapistId);
    Task<List<ClientResponse>> GetParentLinkedClientsAsync(string parentUserId);
    Task<ClientResponse?> UpdateClientAsync(string clientId, string therapistId, UpdateClientRequest request);
    Task<bool> DeleteClientAsync(string clientId, string therapistId);
    Task<ClientGoalDto> AddGoalAsync(string clientId, string therapistId, AddGoalRequest request);
    Task<bool> UpdateGoalAsync(string clientId, string goalId, string therapistId, UpdateGoalRequest request);
    Task<bool> DeleteGoalAsync(string clientId, string goalId, string therapistId);
    Task<bool> UpdateGoalProgressAsync(string clientId, string goalId, int newLevel);
}

public interface ISessionService
{
    Task<SessionResponse> CreateSessionAsync(string therapistId, CreateSessionRequest request);
    Task<SessionResponse?> GetSessionByIdAsync(string sessionId, string userId);
    Task<List<SessionResponse>> GetClientSessionsAsync(string clientId, string userId);
    Task<SessionResponse?> UpdateSessionAsync(string sessionId, string therapistId, UpdateSessionRequest request);
    Task<bool> DeleteSessionAsync(string sessionId, string therapistId);
    Task<List<SessionResponse>> GetSharedSessionsForParentAsync(string parentUserId, string clientId);
    Task<bool> UpdateHomeActivityAsync(string sessionId, string userId, int activityIndex, bool completed, string parentNotes);
}

public interface ITemplateService
{
    Task<TemplateResponse> CreateTemplateAsync(string? createdBy, CreateTemplateRequest request);
    Task<TemplateResponse?> GetTemplateByIdAsync(string templateId);
    Task<List<TemplateResponse>> GetAllTemplatesAsync();
    Task<List<TemplateResponse>> GetTemplatesByCategoryAsync(string category);
    Task IncrementUsageAsync(string templateId);
    Task SeedSystemTemplatesAsync();
}

public interface IStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<Stream> DownloadFileAsync(string fileKey);
    Task<bool> DeleteFileAsync(string fileKey);
    Task<string> GetPresignedUrlAsync(string fileKey, int expirationMinutes = 60);
}

public interface IJwtService
{
    string GenerateToken(User user);
    string? ValidateToken(string token);
}

public interface IGoogleAuthService
{
    Task<GoogleJsonWebSignature.Payload> ValidateGoogleTokenAsync(string idToken);
}

public interface IMfaService
{
    string GenerateSecret();
    string GenerateQrCodeUri(string userEmail, string secret, string issuer = "TherapyNotes");
    byte[] GenerateQrCodeImage(string uri);
    bool ValidateTotp(string secret, string code);
    List<string> GenerateBackupCodes(int count = 10);
    string HashBackupCode(string code);
    bool VerifyBackupCode(string code, string hash);
}

