namespace Regulie.Core.Models;

public static class SubscriptionTier
{
    public const string Free = "free";
    public const string Professional = "professional";
    public const string Premium = "premium";
}

public static class SubscriptionLimits
{
    // Free tier limits
    public const int FreeMaxClients = 3;
    public const int FreeMaxSessionsPerMonth = 15;
    public const double FreeMaxStorageMB = 250;

    // Professional tier limits
    public const int ProfessionalMaxClients = int.MaxValue; // Unlimited
    public const int ProfessionalMaxSessionsPerMonth = int.MaxValue; // Unlimited
    public const double ProfessionalMaxStorageMB = 5120; // 5GB

    // Premium tier limits
    public const int PremiumMaxClients = int.MaxValue; // Unlimited
    public const int PremiumMaxSessionsPerMonth = int.MaxValue; // Unlimited
    public const double PremiumMaxStorageMB = 20480; // 20GB

    public static (int maxClients, int maxSessions, double maxStorageMB) GetLimitsForTier(string tier)
    {
        return tier switch
        {
            SubscriptionTier.Professional => (ProfessionalMaxClients, ProfessionalMaxSessionsPerMonth, ProfessionalMaxStorageMB),
            SubscriptionTier.Premium => (PremiumMaxClients, PremiumMaxSessionsPerMonth, PremiumMaxStorageMB),
            _ => (FreeMaxClients, FreeMaxSessionsPerMonth, FreeMaxStorageMB) // Default to free
        };
    }
}

