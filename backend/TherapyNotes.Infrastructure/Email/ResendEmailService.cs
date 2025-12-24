namespace TherapyNotes.Infrastructure.Email;

// Placeholder email service - replace with actual implementation when Resend API is figured out
// For now, this is a no-op service that allows the app to build and run
public class ResendEmailService
{
    private readonly string _apiKey;
    private readonly string _fromEmail;

    public ResendEmailService(string apiKey, string fromEmail = "TherapyNotes <noreply@therapynotes.app>")
    {
        _apiKey = apiKey;
        _fromEmail = fromEmail;
    }

    public async Task SendParentInviteAsync(string parentEmail, string parentName, string childName, string tempPassword)
    {
        // TODO: Implement actual Resend API call when API signature is confirmed
        // For now, just log that email would be sent
        Console.WriteLine($"[EMAIL] Parent invite would be sent to {parentEmail}");
        await Task.CompletedTask;
    }

    public async Task SendSessionSharedNotificationAsync(string parentEmail, string childName, string therapistName, DateTime sessionDate)
    {
        Console.WriteLine($"[EMAIL] Session notification would be sent to {parentEmail}");
        await Task.CompletedTask;
    }

    public async Task SendWeeklySummaryAsync(string parentEmail, string childName, int sessionCount, List<string> recentActivities)
    {
        Console.WriteLine($"[EMAIL] Weekly summary would be sent to {parentEmail}");
        await Task.CompletedTask;
    }

    public async Task SendUsageLimitWarningAsync(string therapistEmail, string therapistName, string limitType)
    {
        Console.WriteLine($"[EMAIL] Usage warning would be sent to {therapistEmail}");
        await Task.CompletedTask;
    }

    public async Task SendAccessRequestNotificationAsync(string therapistEmail, string therapistName, string parentName, string childName)
    {
        Console.WriteLine($"[EMAIL] Access request notification would be sent to {therapistEmail}: {parentName} requested access for {childName}");
        await Task.CompletedTask;
    }

    public async Task SendAccessApprovedNotificationAsync(string parentEmail, string parentName, string childName)
    {
        Console.WriteLine($"[EMAIL] Access approved notification would be sent to {parentEmail}: Access to {childName}'s therapy notes approved");
        await Task.CompletedTask;
    }

    public async Task SendAccessRejectedNotificationAsync(string parentEmail, string parentName, string childName, string? reason)
    {
        Console.WriteLine($"[EMAIL] Access rejected notification would be sent to {parentEmail}: Access to {childName}'s therapy notes rejected. Reason: {reason}");
        await Task.CompletedTask;
    }
}
