namespace TherapyNotes.Core.DTOs;

// Auth DTOs
public record RegisterRequest(string Email, string Password, string Name, string Role = "therapist");
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, string UserId, string Email, string Name, string Role, string SubscriptionTier);

// Client DTOs
public record CreateClientRequest(string Name, DateTime? DateOfBirth, List<string>? Diagnosis, string? DiagnosisNotes);
public record UpdateClientRequest(string Name, DateTime? DateOfBirth, List<string>? Diagnosis, string? DiagnosisNotes);
public record ClientResponse(
    string Id,
    string TherapistId,
    string Name,
    DateTime? DateOfBirth,
    List<string> Diagnosis,
    string DiagnosisNotes,
    List<string> ParentUserIds,
    List<ClientGoalDto> Goals,
    DateTime CreatedAt
);
public record ClientGoalDto(string GoalId, string Description, DateTime? TargetDate, int CurrentLevel, DateTime CreatedAt);
public record AddGoalRequest(string? ClientId, string Description, DateTime? TargetDate);
public record UpdateGoalRequest(string Description, DateTime? TargetDate);
public record UpdateGoalProgressRequest(int NewLevel);

// Session DTOs
public record CreateSessionRequest(
    string ClientId,
    DateTime SessionDate,
    int DurationMinutes,
    string? Template,
    List<string>? ActivitiesDone,
    List<GoalProgressDto>? GoalsWorkedOn,
    string? Observations,
    string? NextSteps,
    List<HomeActivityDto>? HomeActivities,
    bool SharedWithParents
);

public record UpdateSessionRequest(
    DateTime SessionDate,
    int DurationMinutes,
    string? Template,
    List<string>? ActivitiesDone,
    List<GoalProgressDto>? GoalsWorkedOn,
    string? Observations,
    string? NextSteps,
    List<HomeActivityDto>? HomeActivities,
    bool SharedWithParents
);

public record SessionResponse(
    string Id,
    string ClientId,
    string TherapistId,
    DateTime SessionDate,
    int DurationMinutes,
    string Template,
    List<string> ActivitiesDone,
    List<GoalProgressDto> GoalsWorkedOn,
    string Observations,
    string NextSteps,
    List<HomeActivityDto> HomeActivities,
    List<MediaAttachmentDto> MediaAttachments,
    bool SharedWithParents,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record GoalProgressDto(string GoalId, string ProgressNotes, int LevelUpdate);
public record HomeActivityDto(string Activity, string Instructions, bool CompletedByParent, string ParentNotes);
public record MediaAttachmentDto(string FileKey, string FileName, string FileType, long FileSize, DateTime UploadedAt);

// Template DTOs
public record CreateTemplateRequest(string Name, string Category, string? Description, List<string>? Activities, List<string>? CommonGoals);
public record TemplateResponse(
    string Id,
    string Name,
    string Category,
    string Description,
    List<string> Activities,
    List<string> CommonGoals,
    int UsageCount,
    bool IsSystemTemplate,
    DateTime CreatedAt
);

// Parent DTOs
public record InviteParentRequest(string ClientId, string ParentEmail, string ParentName);

// OAuth DTOs
public record GoogleLoginRequest(string IdToken, string? Role = null);
public record OAuthAuthResponse(string Token, string UserId, string Email, string Name, string Role, string SubscriptionTier, bool RequiresMfa = false, string? TempToken = null);

// MFA DTOs
public record MfaSetupResponse(string Secret, string QrCodeUri, byte[] QrCodeImage, List<string> BackupCodes);
public record VerifyMfaSetupRequest(string Code);
public record MfaVerifyRequest(string TempToken, string Code, bool IsBackupCode = false);
public record DisableMfaRequest(string Password);

// Access Request DTOs
public record CreateAccessRequestDto(string ChildFirstName, string ChildLastName, DateTime ChildDateOfBirth, string TherapistEmail);
public record ApproveAccessRequestDto(string ClientId);
public record AccessRequestResponseDto(
    string Id,
    string ParentUserId,
    string ParentEmail,
    string ParentName,
    string ChildFirstName,
    string ChildLastName,
    DateTime ChildDateOfBirth,
    string TherapistEmail,
    string Status,
    string? LinkedClientId,
    string? RejectionReason,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

