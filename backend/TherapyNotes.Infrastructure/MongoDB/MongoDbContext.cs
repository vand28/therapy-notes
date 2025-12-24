using MongoDB.Driver;
using TherapyNotes.Core.Models;

namespace TherapyNotes.Infrastructure.MongoDB;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(string connectionString, string databaseName)
    {
        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    public IMongoCollection<Client> Clients => _database.GetCollection<Client>("clients");
    public IMongoCollection<Session> Sessions => _database.GetCollection<Session>("sessions");
    public IMongoCollection<Template> Templates => _database.GetCollection<Template>("templates");
    public IMongoCollection<AccessRequest> AccessRequests => _database.GetCollection<AccessRequest>("accessRequests");

    public async Task InitializeAsync()
    {
        // Create indexes for better query performance
        
        // Users indexes
        var userEmailIndex = Builders<User>.IndexKeys.Ascending(u => u.Email);
        await Users.Indexes.CreateOneAsync(new CreateIndexModel<User>(userEmailIndex, new CreateIndexOptions { Unique = true }));

        // Clients indexes
        var clientTherapistIndex = Builders<Client>.IndexKeys.Ascending(c => c.TherapistId);
        await Clients.Indexes.CreateOneAsync(new CreateIndexModel<Client>(clientTherapistIndex));

        // Sessions indexes
        var sessionClientIndex = Builders<Session>.IndexKeys.Ascending(s => s.ClientId);
        var sessionTherapistIndex = Builders<Session>.IndexKeys.Ascending(s => s.TherapistId);
        var sessionDateIndex = Builders<Session>.IndexKeys.Descending(s => s.SessionDate);
        
        await Sessions.Indexes.CreateOneAsync(new CreateIndexModel<Session>(sessionClientIndex));
        await Sessions.Indexes.CreateOneAsync(new CreateIndexModel<Session>(sessionTherapistIndex));
        await Sessions.Indexes.CreateOneAsync(new CreateIndexModel<Session>(sessionDateIndex));

        // Templates indexes
        var templateCategoryIndex = Builders<Template>.IndexKeys.Ascending(t => t.Category);
        await Templates.Indexes.CreateOneAsync(new CreateIndexModel<Template>(templateCategoryIndex));

        // AccessRequests indexes
        var accessRequestParentIndex = Builders<AccessRequest>.IndexKeys.Ascending(ar => ar.ParentUserId);
        var accessRequestTherapistIndex = Builders<AccessRequest>.IndexKeys.Ascending(ar => ar.TherapistEmail);
        var accessRequestStatusIndex = Builders<AccessRequest>.IndexKeys.Ascending(ar => ar.Status);
        
        await AccessRequests.Indexes.CreateOneAsync(new CreateIndexModel<AccessRequest>(accessRequestParentIndex));
        await AccessRequests.Indexes.CreateOneAsync(new CreateIndexModel<AccessRequest>(accessRequestTherapistIndex));
        await AccessRequests.Indexes.CreateOneAsync(new CreateIndexModel<AccessRequest>(accessRequestStatusIndex));
    }
}


