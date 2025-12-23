using MongoDB.Driver;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Interfaces;
using TherapyNotes.Core.Models;
using TherapyNotes.Infrastructure.MongoDB;

namespace TherapyNotes.Infrastructure.Services;

public class ClientService : IClientService
{
    private readonly MongoDbContext _dbContext;

    public ClientService(MongoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ClientResponse> CreateClientAsync(string therapistId, CreateClientRequest request)
    {
        var client = new Client
        {
            TherapistId = therapistId,
            Name = request.Name,
            DateOfBirth = request.DateOfBirth,
            Diagnosis = request.Diagnosis ?? new List<string>(),
            DiagnosisNotes = request.DiagnosisNotes ?? string.Empty,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _dbContext.Clients.InsertOneAsync(client);

        // Update therapist's client count
        await UpdateTherapistClientCount(therapistId);

        return MapToResponse(client);
    }

    public async Task<ClientResponse?> GetClientByIdAsync(string clientId, string userId)
    {
        var client = await _dbContext.Clients
            .Find(c => c.Id == clientId)
            .FirstOrDefaultAsync();

        if (client == null) return null;

        // Check if user has access (therapist or parent)
        var user = await _dbContext.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return null;

        if (user.Role == "therapist" && client.TherapistId != userId)
            return null;

        if (user.Role == "parent" && !client.ParentUserIds.Contains(userId))
            return null;

        return MapToResponse(client);
    }

    public async Task<List<ClientResponse>> GetTherapistClientsAsync(string therapistId)
    {
        var clients = await _dbContext.Clients
            .Find(c => c.TherapistId == therapistId)
            .SortByDescending(c => c.CreatedAt)
            .ToListAsync();

        return clients.Select(MapToResponse).ToList();
    }

    public async Task<List<ClientResponse>> GetParentLinkedClientsAsync(string parentUserId)
    {
        var clients = await _dbContext.Clients
            .Find(c => c.ParentUserIds.Contains(parentUserId))
            .SortByDescending(c => c.CreatedAt)
            .ToListAsync();

        return clients.Select(MapToResponse).ToList();
    }

    public async Task<ClientResponse?> UpdateClientAsync(string clientId, string therapistId, UpdateClientRequest request)
    {
        var filter = Builders<Client>.Filter.And(
            Builders<Client>.Filter.Eq(c => c.Id, clientId),
            Builders<Client>.Filter.Eq(c => c.TherapistId, therapistId)
        );

        var update = Builders<Client>.Update
            .Set(c => c.Name, request.Name)
            .Set(c => c.DateOfBirth, request.DateOfBirth)
            .Set(c => c.Diagnosis, request.Diagnosis ?? new List<string>())
            .Set(c => c.DiagnosisNotes, request.DiagnosisNotes ?? string.Empty)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        var client = await _dbContext.Clients.FindOneAndUpdateAsync(
            filter,
            update,
            new FindOneAndUpdateOptions<Client> { ReturnDocument = ReturnDocument.After }
        );

        return client != null ? MapToResponse(client) : null;
    }

    public async Task<bool> DeleteClientAsync(string clientId, string therapistId)
    {
        var filter = Builders<Client>.Filter.And(
            Builders<Client>.Filter.Eq(c => c.Id, clientId),
            Builders<Client>.Filter.Eq(c => c.TherapistId, therapistId)
        );

        var result = await _dbContext.Clients.DeleteOneAsync(filter);

        if (result.DeletedCount > 0)
        {
            // Also delete all sessions for this client
            await _dbContext.Sessions.DeleteManyAsync(s => s.ClientId == clientId);

            // Update therapist's client count
            await UpdateTherapistClientCount(therapistId);

            return true;
        }

        return false;
    }

    public async Task<ClientGoalDto> AddGoalAsync(string clientId, string therapistId, AddGoalRequest request)
    {
        var goal = new ClientGoal
        {
            Description = request.Description,
            TargetDate = request.TargetDate,
            CurrentLevel = 0,
            CreatedAt = DateTime.UtcNow,
            LastUpdated = DateTime.UtcNow
        };

        var filter = Builders<Client>.Filter.And(
            Builders<Client>.Filter.Eq(c => c.Id, clientId),
            Builders<Client>.Filter.Eq(c => c.TherapistId, therapistId)
        );

        var update = Builders<Client>.Update
            .Push(c => c.Goals, goal)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        await _dbContext.Clients.UpdateOneAsync(filter, update);

        return new ClientGoalDto(goal.GoalId, goal.Description, goal.TargetDate, goal.CurrentLevel, goal.CreatedAt);
    }

    public async Task<bool> UpdateGoalAsync(string clientId, string goalId, string therapistId, UpdateGoalRequest request)
    {
        var filter = Builders<Client>.Filter.And(
            Builders<Client>.Filter.Eq(c => c.Id, clientId),
            Builders<Client>.Filter.Eq(c => c.TherapistId, therapistId),
            Builders<Client>.Filter.ElemMatch(c => c.Goals, g => g.GoalId == goalId)
        );

        var update = Builders<Client>.Update
            .Set("goals.$.description", request.Description)
            .Set("goals.$.targetDate", request.TargetDate)
            .Set("goals.$.lastUpdated", DateTime.UtcNow)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        var result = await _dbContext.Clients.UpdateOneAsync(filter, update);

        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteGoalAsync(string clientId, string goalId, string therapistId)
    {
        var filter = Builders<Client>.Filter.And(
            Builders<Client>.Filter.Eq(c => c.Id, clientId),
            Builders<Client>.Filter.Eq(c => c.TherapistId, therapistId)
        );

        var update = Builders<Client>.Update
            .PullFilter(c => c.Goals, g => g.GoalId == goalId)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        var result = await _dbContext.Clients.UpdateOneAsync(filter, update);

        return result.ModifiedCount > 0;
    }

    public async Task<bool> UpdateGoalProgressAsync(string clientId, string goalId, int newLevel)
    {
        var filter = Builders<Client>.Filter.And(
            Builders<Client>.Filter.Eq(c => c.Id, clientId),
            Builders<Client>.Filter.ElemMatch(c => c.Goals, g => g.GoalId == goalId)
        );

        var update = Builders<Client>.Update
            .Set("goals.$.currentLevel", newLevel)
            .Set("goals.$.lastUpdated", DateTime.UtcNow)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        var result = await _dbContext.Clients.UpdateOneAsync(filter, update);

        return result.ModifiedCount > 0;
    }

    private async Task UpdateTherapistClientCount(string therapistId)
    {
        var clientCount = await _dbContext.Clients
            .CountDocumentsAsync(c => c.TherapistId == therapistId);

        var filter = Builders<User>.Filter.Eq(u => u.Id, therapistId);
        var update = Builders<User>.Update.Set("usageStats.clientCount", (int)clientCount);

        await _dbContext.Users.UpdateOneAsync(filter, update);
    }

    private ClientResponse MapToResponse(Client client)
    {
        return new ClientResponse(
            client.Id,
            client.TherapistId,
            client.Name,
            client.DateOfBirth,
            client.Diagnosis,
            client.DiagnosisNotes,
            client.ParentUserIds,
            client.Goals.Select(g => new ClientGoalDto(g.GoalId, g.Description, g.TargetDate, g.CurrentLevel, g.CreatedAt)).ToList(),
            client.CreatedAt
        );
    }
}

