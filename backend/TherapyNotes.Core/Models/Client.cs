using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TherapyNotes.Core.Models;

public class Client
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("therapistId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonRequired]
    public string TherapistId { get; set; } = string.Empty;

    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    [BsonElement("dateOfBirth")]
    public DateTime? DateOfBirth { get; set; }

    [BsonElement("diagnosis")]
    public List<string> Diagnosis { get; set; } = new();

    [BsonElement("diagnosisNotes")]
    public string DiagnosisNotes { get; set; } = string.Empty;

    [BsonElement("parentUserIds")]
    [BsonRepresentation(BsonType.ObjectId)]
    public List<string> ParentUserIds { get; set; } = new();

    [BsonElement("goals")]
    public List<ClientGoal> Goals { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ClientGoal
{
    [BsonElement("goalId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string GoalId { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("targetDate")]
    public DateTime? TargetDate { get; set; }

    [BsonElement("currentLevel")]
    public int CurrentLevel { get; set; } = 0; // 0-100

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("lastUpdated")]
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

