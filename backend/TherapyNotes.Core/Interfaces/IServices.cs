using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Models;

namespace TherapyNotes.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<User?> GetUserByIdAsync(string userId);
    Task<User?> GetUserByEmailAsync(string email);
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

