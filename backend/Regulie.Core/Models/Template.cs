using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Regulie.Core.Models;

public class Template
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    [BsonElement("category")]
    [BsonRequired]
    public string Category { get; set; } = string.Empty; // "fine-motor", "sensory", "communication", etc.

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("activities")]
    public List<string> Activities { get; set; } = new();

    [BsonElement("commonGoals")]
    public List<string> CommonGoals { get; set; } = new();

    [BsonElement("usageCount")]
    public int UsageCount { get; set; } = 0;

    [BsonElement("isSystemTemplate")]
    public bool IsSystemTemplate { get; set; } = true; // System vs user-created

    [BsonElement("createdBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CreatedBy { get; set; } // null for system templates

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

