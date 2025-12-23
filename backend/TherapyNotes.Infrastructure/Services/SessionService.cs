using MongoDB.Driver;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Interfaces;
using TherapyNotes.Core.Models;
using TherapyNotes.Infrastructure.MongoDB;

namespace TherapyNotes.Infrastructure.Services;

public class SessionService : ISessionService
{
    private readonly MongoDbContext _dbContext;

    public SessionService(MongoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SessionResponse> CreateSessionAsync(string therapistId, CreateSessionRequest request)
    {
        // Verify client belongs to therapist
        var client = await _dbContext.Clients
            .Find(c => c.Id == request.ClientId && c.TherapistId == therapistId)
            .FirstOrDefaultAsync();

        if (client == null)
            throw new UnauthorizedAccessException("Client not found or doesn't belong to therapist");

        var session = new Session
        {
            ClientId = request.ClientId,
            TherapistId = therapistId,
            SessionDate = request.SessionDate,
            DurationMinutes = request.DurationMinutes,
            Template = request.Template ?? string.Empty,
            ActivitiesDone = request.ActivitiesDone ?? new List<string>(),
            GoalsWorkedOn = MapGoalProgress(request.GoalsWorkedOn),
            Observations = request.Observations ?? string.Empty,
            NextSteps = request.NextSteps ?? string.Empty,
            HomeActivities = MapHomeActivities(request.HomeActivities),
            SharedWithParents = request.SharedWithParents,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _dbContext.Sessions.InsertOneAsync(session);

        // Update goal progress in client
        if (request.GoalsWorkedOn != null)
        {
            foreach (var goalProgress in request.GoalsWorkedOn)
            {
                await UpdateClientGoalProgress(request.ClientId, goalProgress.GoalId, goalProgress.LevelUpdate);
            }
        }

        // Update therapist's session count
        await UpdateTherapistSessionCount(therapistId);

        return MapToResponse(session);
    }

    public async Task<SessionResponse?> GetSessionByIdAsync(string sessionId, string userId)
    {
        var session = await _dbContext.Sessions
            .Find(s => s.Id == sessionId)
            .FirstOrDefaultAsync();

        if (session == null) return null;

        // Check access
        var user = await _dbContext.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return null;

        if (user.Role == "therapist" && session.TherapistId != userId)
            return null;

        if (user.Role == "parent")
        {
            var client = await _dbContext.Clients.Find(c => c.Id == session.ClientId).FirstOrDefaultAsync();
            if (client == null || !client.ParentUserIds.Contains(userId) || !session.SharedWithParents)
                return null;
        }

        return MapToResponse(session);
    }

    public async Task<List<SessionResponse>> GetClientSessionsAsync(string clientId, string userId)
    {
        var user = await _dbContext.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return new List<SessionResponse>();

        FilterDefinition<Session> filter;

        if (user.Role == "therapist")
        {
            // Therapist can see all sessions for their clients
            var client = await _dbContext.Clients
                .Find(c => c.Id == clientId && c.TherapistId == userId)
                .FirstOrDefaultAsync();

            if (client == null) return new List<SessionResponse>();

            filter = Builders<Session>.Filter.Eq(s => s.ClientId, clientId);
        }
        else // parent
        {
            // Parent can only see shared sessions
            var client = await _dbContext.Clients.Find(c => c.Id == clientId).FirstOrDefaultAsync();
            if (client == null || !client.ParentUserIds.Contains(userId))
                return new List<SessionResponse>();

            filter = Builders<Session>.Filter.And(
                Builders<Session>.Filter.Eq(s => s.ClientId, clientId),
                Builders<Session>.Filter.Eq(s => s.SharedWithParents, true)
            );
        }

        var sessions = await _dbContext.Sessions
            .Find(filter)
            .SortByDescending(s => s.SessionDate)
            .ToListAsync();

        return sessions.Select(MapToResponse).ToList();
    }

    public async Task<SessionResponse?> UpdateSessionAsync(string sessionId, string therapistId, UpdateSessionRequest request)
    {
        var filter = Builders<Session>.Filter.And(
            Builders<Session>.Filter.Eq(s => s.Id, sessionId),
            Builders<Session>.Filter.Eq(s => s.TherapistId, therapistId)
        );

        var update = Builders<Session>.Update
            .Set(s => s.SessionDate, request.SessionDate)
            .Set(s => s.DurationMinutes, request.DurationMinutes)
            .Set(s => s.Template, request.Template ?? string.Empty)
            .Set(s => s.ActivitiesDone, request.ActivitiesDone ?? new List<string>())
            .Set(s => s.GoalsWorkedOn, MapGoalProgress(request.GoalsWorkedOn))
            .Set(s => s.Observations, request.Observations ?? string.Empty)
            .Set(s => s.NextSteps, request.NextSteps ?? string.Empty)
            .Set(s => s.HomeActivities, MapHomeActivities(request.HomeActivities))
            .Set(s => s.SharedWithParents, request.SharedWithParents)
            .Set(s => s.UpdatedAt, DateTime.UtcNow);

        var session = await _dbContext.Sessions.FindOneAndUpdateAsync(
            filter,
            update,
            new FindOneAndUpdateOptions<Session> { ReturnDocument = ReturnDocument.After }
        );

        // Update goal progress
        if (session != null && request.GoalsWorkedOn != null)
        {
            foreach (var goalProgress in request.GoalsWorkedOn)
            {
                await UpdateClientGoalProgress(session.ClientId, goalProgress.GoalId, goalProgress.LevelUpdate);
            }
        }

        return session != null ? MapToResponse(session) : null;
    }

    public async Task<bool> DeleteSessionAsync(string sessionId, string therapistId)
    {
        var filter = Builders<Session>.Filter.And(
            Builders<Session>.Filter.Eq(s => s.Id, sessionId),
            Builders<Session>.Filter.Eq(s => s.TherapistId, therapistId)
        );

        var result = await _dbContext.Sessions.DeleteOneAsync(filter);

        if (result.DeletedCount > 0)
        {
            await UpdateTherapistSessionCount(therapistId);
            return true;
        }

        return false;
    }

    public async Task<List<SessionResponse>> GetSharedSessionsForParentAsync(string parentUserId, string clientId)
    {
        var client = await _dbContext.Clients.Find(c => c.Id == clientId).FirstOrDefaultAsync();
        if (client == null || !client.ParentUserIds.Contains(parentUserId))
            return new List<SessionResponse>();

        var sessions = await _dbContext.Sessions
            .Find(s => s.ClientId == clientId && s.SharedWithParents == true)
            .SortByDescending(s => s.SessionDate)
            .ToListAsync();

        return sessions.Select(MapToResponse).ToList();
    }

    public async Task<bool> UpdateHomeActivityAsync(string sessionId, string userId, int activityIndex, bool completed, string parentNotes)
    {
        var session = await _dbContext.Sessions.Find(s => s.Id == sessionId).FirstOrDefaultAsync();
        if (session == null) return false;

        // Verify user has access (parent or therapist)
        var user = await _dbContext.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return false;

        if (user.Role == "parent")
        {
            var client = await _dbContext.Clients.Find(c => c.Id == session.ClientId).FirstOrDefaultAsync();
            if (client == null || !client.ParentUserIds.Contains(userId) || !session.SharedWithParents)
                return false;
        }
        else if (user.Role == "therapist" && session.TherapistId != userId)
        {
            return false;
        }

        if (activityIndex < 0 || activityIndex >= session.HomeActivities.Count)
            return false;

        var filter = Builders<Session>.Filter.Eq(s => s.Id, sessionId);
        var update = Builders<Session>.Update
            .Set($"homeActivities.{activityIndex}.completedByParent", completed)
            .Set($"homeActivities.{activityIndex}.parentNotes", parentNotes ?? string.Empty)
            .Set(s => s.UpdatedAt, DateTime.UtcNow);

        var result = await _dbContext.Sessions.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    private async Task UpdateClientGoalProgress(string clientId, string goalId, int newLevel)
    {
        var filter = Builders<Client>.Filter.And(
            Builders<Client>.Filter.Eq(c => c.Id, clientId),
            Builders<Client>.Filter.ElemMatch(c => c.Goals, g => g.GoalId == goalId)
        );

        var update = Builders<Client>.Update
            .Set("goals.$.currentLevel", newLevel)
            .Set("goals.$.lastUpdated", DateTime.UtcNow);

        await _dbContext.Clients.UpdateOneAsync(filter, update);
    }

    private async Task UpdateTherapistSessionCount(string therapistId)
    {
        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var sessionCount = await _dbContext.Sessions
            .CountDocumentsAsync(s => s.TherapistId == therapistId && s.CreatedAt >= startOfMonth);

        var filter = Builders<User>.Filter.Eq(u => u.Id, therapistId);
        var update = Builders<User>.Update.Set("usageStats.sessionsThisMonth", (int)sessionCount);

        await _dbContext.Users.UpdateOneAsync(filter, update);
    }

    private List<GoalProgress> MapGoalProgress(List<GoalProgressDto>? dtos)
    {
        if (dtos == null) return new List<GoalProgress>();
        return dtos.Select(d => new GoalProgress
        {
            GoalId = d.GoalId,
            ProgressNotes = d.ProgressNotes,
            LevelUpdate = d.LevelUpdate
        }).ToList();
    }

    private List<HomeActivity> MapHomeActivities(List<HomeActivityDto>? dtos)
    {
        if (dtos == null) return new List<HomeActivity>();
        return dtos.Select(d => new HomeActivity
        {
            Activity = d.Activity,
            Instructions = d.Instructions,
            CompletedByParent = d.CompletedByParent,
            ParentNotes = d.ParentNotes
        }).ToList();
    }

    private SessionResponse MapToResponse(Session session)
    {
        return new SessionResponse(
            session.Id,
            session.ClientId,
            session.TherapistId,
            session.SessionDate,
            session.DurationMinutes,
            session.Template,
            session.ActivitiesDone,
            session.GoalsWorkedOn.Select(g => new GoalProgressDto(g.GoalId, g.ProgressNotes, g.LevelUpdate)).ToList(),
            session.Observations,
            session.NextSteps,
            session.HomeActivities.Select(h => new HomeActivityDto(h.Activity, h.Instructions, h.CompletedByParent, h.ParentNotes)).ToList(),
            session.MediaAttachments.Select(m => new MediaAttachmentDto(m.FileKey, m.FileName, m.FileType, m.FileSize, m.UploadedAt)).ToList(),
            session.SharedWithParents,
            session.CreatedAt,
            session.UpdatedAt
        );
    }
}

