using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TherapyNotes.Core.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("email")]
    [BsonRequired]
    public string Email { get; set; } = string.Empty;

    [BsonElement("passwordHash")]
    [BsonRequired]
    public string PasswordHash { get; set; } = string.Empty;

    [BsonElement("role")]
    [BsonRequired]
    public string Role { get; set; } = "therapist"; // "therapist" | "parent"

    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    [BsonElement("linkedClientIds")]
    public List<string> LinkedClientIds { get; set; } = new();

    [BsonElement("subscriptionTier")]
    public string SubscriptionTier { get; set; } = "free"; // "free" | "professional" | "premium"

    [BsonElement("stripeCustomerId")]
    public string? StripeCustomerId { get; set; }

    [BsonElement("usageStats")]
    public UsageStats UsageStats { get; set; } = new();

    [BsonElement("preferences")]
    public UserPreferences Preferences { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UsageStats
{
    [BsonElement("clientCount")]
    public int ClientCount { get; set; }

    [BsonElement("sessionsThisMonth")]
    public int SessionsThisMonth { get; set; }

    [BsonElement("storageUsedMB")]
    public double StorageUsedMB { get; set; }
}

public class UserPreferences
{
    [BsonElement("emailNotifications")]
    public bool EmailNotifications { get; set; } = true;

    [BsonElement("defaultTemplates")]
    public List<string> DefaultTemplates { get; set; } = new();
}

