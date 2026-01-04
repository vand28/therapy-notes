using Regulie.Core.DTOs;

namespace Regulie.Core.Interfaces;

public interface IUsageLimitService
{
    Task<bool> CanCreateClientAsync(string userId);
    Task<bool> CanCreateSessionAsync(string userId);
    Task<bool> CanUploadFileAsync(string userId, long fileSizeBytes);
    Task<UsageSummaryResponse> GetUsageSummaryAsync(string userId);
    Task UpdateStorageUsageAsync(string userId, long fileSizeBytes);
}

