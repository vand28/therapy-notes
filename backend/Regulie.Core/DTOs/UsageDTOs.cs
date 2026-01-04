namespace Regulie.Core.DTOs;

public record UsageSummaryResponse(
    string SubscriptionTier,
    UsageMetrics Current,
    UsageMetrics Limits,
    bool CanCreateClient,
    bool CanCreateSession,
    bool CanUploadFile
);

public record UsageMetrics(
    int ClientCount,
    int SessionsThisMonth,
    double StorageUsedMB
);

