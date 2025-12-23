using MongoDB.Driver;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Interfaces;
using TherapyNotes.Core.Models;
using TherapyNotes.Infrastructure.MongoDB;

namespace TherapyNotes.Infrastructure.Services;

public class UsageLimitService : IUsageLimitService
{
    private readonly MongoDbContext _dbContext;

    public UsageLimitService(MongoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> CanCreateClientAsync(string userId)
    {
        var user = await GetUserAsync(userId);
        if (user == null) return false;

        var limits = SubscriptionLimits.GetLimitsForTier(user.SubscriptionTier);
        return user.UsageStats.ClientCount < limits.maxClients;
    }

    public async Task<bool> CanCreateSessionAsync(string userId)
    {
        var user = await GetUserAsync(userId);
        if (user == null) return false;

        var limits = SubscriptionLimits.GetLimitsForTier(user.SubscriptionTier);
        return user.UsageStats.SessionsThisMonth < limits.maxSessions;
    }

    public async Task<bool> CanUploadFileAsync(string userId, long fileSizeBytes)
    {
        var user = await GetUserAsync(userId);
        if (user == null) return false;

        var fileSizeMB = fileSizeBytes / (1024.0 * 1024.0);
        var limits = SubscriptionLimits.GetLimitsForTier(user.SubscriptionTier);
        
        return (user.UsageStats.StorageUsedMB + fileSizeMB) <= limits.maxStorageMB;
    }

    public async Task<UsageSummaryResponse> GetUsageSummaryAsync(string userId)
    {
        var user = await GetUserAsync(userId);
        if (user == null)
            throw new InvalidOperationException("User not found");

        var limits = SubscriptionLimits.GetLimitsForTier(user.SubscriptionTier);

        var current = new UsageMetrics(
            user.UsageStats.ClientCount,
            user.UsageStats.SessionsThisMonth,
            user.UsageStats.StorageUsedMB
        );

        var maxLimits = new UsageMetrics(
            limits.maxClients,
            limits.maxSessions,
            limits.maxStorageMB
        );

        return new UsageSummaryResponse(
            user.SubscriptionTier,
            current,
            maxLimits,
            await CanCreateClientAsync(userId),
            await CanCreateSessionAsync(userId),
            true // File upload check requires size
        );
    }

    public async Task UpdateStorageUsageAsync(string userId, long fileSizeBytes)
    {
        var fileSizeMB = fileSizeBytes / (1024.0 * 1024.0);
        
        var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
        var update = Builders<User>.Update.Inc("usageStats.storageUsedMB", fileSizeMB);
        
        await _dbContext.Users.UpdateOneAsync(filter, update);
    }

    private async Task<User?> GetUserAsync(string userId)
    {
        return await _dbContext.Users
            .Find(u => u.Id == userId)
            .FirstOrDefaultAsync();
    }
}

