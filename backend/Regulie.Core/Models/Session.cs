using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Regulie.Core.Models;

public class Session
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("clientId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonRequired]
    public string ClientId { get; set; } = string.Empty;

    [BsonElement("therapistId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonRequired]
    public string TherapistId { get; set; } = string.Empty;

    [BsonElement("sessionDate")]
    [BsonRequired]
    public DateTime SessionDate { get; set; }

    [BsonElement("durationMinutes")]
    public int DurationMinutes { get; set; }

    [BsonElement("template")]
    public string Template { get; set; } = string.Empty;

    [BsonElement("activitiesDone")]
    public List<string> ActivitiesDone { get; set; } = new();

    [BsonElement("goalsWorkedOn")]
    public List<GoalProgress> GoalsWorkedOn { get; set; } = new();

    [BsonElement("observations")]
    public string Observations { get; set; } = string.Empty;

    [BsonElement("nextSteps")]
    public string NextSteps { get; set; } = string.Empty;

    [BsonElement("homeActivities")]
    public List<HomeActivity> HomeActivities { get; set; } = new();

    [BsonElement("mediaAttachments")]
    public List<MediaAttachment> MediaAttachments { get; set; } = new();

    [BsonElement("sharedWithParents")]
    public bool SharedWithParents { get; set; } = false;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class GoalProgress
{
    [BsonElement("goalId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string GoalId { get; set; } = string.Empty;

    [BsonElement("progressNotes")]
    public string ProgressNotes { get; set; } = string.Empty;

    [BsonElement("levelUpdate")]
    public int LevelUpdate { get; set; } // 0-100
}

public class HomeActivity
{
    [BsonElement("activity")]
    public string Activity { get; set; } = string.Empty;

    [BsonElement("instructions")]
    public string Instructions { get; set; } = string.Empty;

    [BsonElement("completedByParent")]
    public bool CompletedByParent { get; set; } = false;

    [BsonElement("parentNotes")]
    public string ParentNotes { get; set; } = string.Empty;
}

public class MediaAttachment
{
    [BsonElement("fileKey")]
    public string FileKey { get; set; } = string.Empty;

    [BsonElement("fileName")]
    public string FileName { get; set; } = string.Empty;

    [BsonElement("fileType")]
    public string FileType { get; set; } = string.Empty;

    [BsonElement("fileSize")]
    public long FileSize { get; set; }

    [BsonElement("uploadedAt")]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

