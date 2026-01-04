using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Regulie.Core.Models;

public class AccessRequest
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("parentUserId")]
    [BsonRequired]
    public string ParentUserId { get; set; } = string.Empty;

    [BsonElement("parentEmail")]
    [BsonRequired]
    public string ParentEmail { get; set; } = string.Empty;

    [BsonElement("parentName")]
    [BsonRequired]
    public string ParentName { get; set; } = string.Empty;

    [BsonElement("childFirstName")]
    [BsonRequired]
    public string ChildFirstName { get; set; } = string.Empty;

    [BsonElement("childLastName")]
    [BsonRequired]
    public string ChildLastName { get; set; } = string.Empty;

    [BsonElement("childDateOfBirth")]
    [BsonRequired]
    public DateTime ChildDateOfBirth { get; set; }

    [BsonElement("therapistEmail")]
    [BsonRequired]
    public string TherapistEmail { get; set; } = string.Empty;

    [BsonElement("status")]
    [BsonRequired]
    public string Status { get; set; } = "pending"; // "pending" | "approved" | "rejected"

    [BsonElement("linkedClientId")]
    public string? LinkedClientId { get; set; } // Set when approved

    [BsonElement("rejectionReason")]
    public string? RejectionReason { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

