using Xunit;
using Moq;
using FluentAssertions;
using MongoDB.Driver;
using Regulie.Core.Models;
using Regulie.Infrastructure.Services;
using Regulie.Infrastructure.MongoDB;

namespace Regulie.Tests;

public class UsageLimitServiceTests
{
    private readonly Mock<MongoDbContext> _mockContext;
    private readonly UsageLimitService _service;

    public UsageLimitServiceTests()
    {
        _mockContext = new Mock<MongoDbContext>();
        _service = new UsageLimitService(_mockContext.Object);
    }

    [Fact]
    public async Task CanCreateClient_FreeUser_WithinLimit_ReturnsTrue()
    {
        // Arrange
        var userId = "test-user-id";
        var user = new User 
        { 
            Id = userId, 
            SubscriptionTier = "free",
            Email = "test@test.com",
            PasswordHash = "hash",
            Name = "Test",
            Role = "therapist"
        };

        var mockUserCollection = new Mock<IMongoCollection<User>>();
        var mockCursor = new Mock<IAsyncCursor<User>>();
        mockCursor.Setup(c => c.Current).Returns(new List<User> { user });
        mockCursor.SetupSequence(c => c.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        mockUserCollection.Setup(c => c.FindAsync(
            It.IsAny<FilterDefinition<User>>(),
            It.IsAny<FindOptions<User, User>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCursor.Object);

        _mockContext.Setup(c => c.Users).Returns(mockUserCollection.Object);

        var mockClientCollection = new Mock<IMongoCollection<Client>>();
        var mockClientCursor = new Mock<IAsyncCursor<Client>>();
        mockClientCursor.Setup(c => c.Current).Returns(new List<Client> { new Client(), new Client() });
        mockClientCursor.SetupSequence(c => c.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        mockClientCollection.Setup(c => c.FindAsync(
            It.IsAny<FilterDefinition<Client>>(),
            It.IsAny<FindOptions<Client, Client>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockClientCursor.Object);

        _mockContext.Setup(c => c.Clients).Returns(mockClientCollection.Object);

        // Act
        var result = await _service.CanCreateClientAsync(userId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CanCreateClient_FreeUser_AtLimit_ReturnsFalse()
    {
        // Arrange
        var userId = "test-user-id";
        var user = new User 
        { 
            Id = userId, 
            SubscriptionTier = "free",
            Email = "test@test.com",
            PasswordHash = "hash",
            Name = "Test",
            Role = "therapist"
        };

        var mockUserCollection = new Mock<IMongoCollection<User>>();
        var mockCursor = new Mock<IAsyncCursor<User>>();
        mockCursor.Setup(c => c.Current).Returns(new List<User> { user });
        mockCursor.SetupSequence(c => c.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        mockUserCollection.Setup(c => c.FindAsync(
            It.IsAny<FilterDefinition<User>>(),
            It.IsAny<FindOptions<User, User>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCursor.Object);

        _mockContext.Setup(c => c.Users).Returns(mockUserCollection.Object);

        // Create 3 clients (at limit)
        var clients = new List<Client>
        {
            new Client { Id = "1", TherapistId = userId },
            new Client { Id = "2", TherapistId = userId },
            new Client { Id = "3", TherapistId = userId }
        };

        var mockClientCollection = new Mock<IMongoCollection<Client>>();
        var mockClientCursor = new Mock<IAsyncCursor<Client>>();
        mockClientCursor.Setup(c => c.Current).Returns(clients);
        mockClientCursor.SetupSequence(c => c.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        mockClientCollection.Setup(c => c.FindAsync(
            It.IsAny<FilterDefinition<Client>>(),
            It.IsAny<FindOptions<Client, Client>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockClientCursor.Object);

        _mockContext.Setup(c => c.Clients).Returns(mockClientCollection.Object);

        // Act
        var result = await _service.CanCreateClientAsync(userId);

        // Assert
        result.Should().BeFalse();
    }
}
