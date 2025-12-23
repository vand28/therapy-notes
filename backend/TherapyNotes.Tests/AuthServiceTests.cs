using Xunit;
using Moq;
using FluentAssertions;
using MongoDB.Driver;
using TherapyNotes.Core.Models;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Interfaces;
using TherapyNotes.Infrastructure.Services;
using TherapyNotes.Infrastructure.MongoDB;

namespace TherapyNotes.Tests;

public class AuthServiceTests
{
    private readonly Mock<MongoDbContext> _mockContext;
    private readonly Mock<IJwtService> _mockJwtService;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _mockContext = new Mock<MongoDbContext>();
        _mockJwtService = new Mock<IJwtService>();
        _mockJwtService.Setup(j => j.GenerateToken(It.IsAny<User>())).Returns("test-jwt-token");
        _service = new AuthService(_mockContext.Object, _mockJwtService.Object);
    }

    [Fact]
    public async Task RegisterAsync_ValidRequest_CreatesUser()
    {
        // Arrange
        var request = new RegisterRequest(
            "test@test.com",
            "password123",
            "Test User",
            "therapist"
        );

        var mockUserCollection = new Mock<IMongoCollection<User>>();
        var mockCursor = new Mock<IAsyncCursor<User>>();
        mockCursor.Setup(c => c.Current).Returns(new List<User>());
        mockCursor.SetupSequence(c => c.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        mockUserCollection.Setup(c => c.FindAsync(
            It.IsAny<FilterDefinition<User>>(),
            It.IsAny<FindOptions<User, User>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCursor.Object);

        mockUserCollection.Setup(c => c.InsertOneAsync(
            It.IsAny<User>(),
            It.IsAny<InsertOneOptions>(),
            It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _mockContext.Setup(c => c.Users).Returns(mockUserCollection.Object);

        // Act
        var result = await _service.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be(request.Email);
        result.Name.Should().Be(request.Name);
        result.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsException()
    {
        // Arrange
        var request = new RegisterRequest(
            "test@test.com",
            "password123",
            "Test User",
            "therapist"
        );

        var existingUser = new User
        {
            Id = "existing-id",
            Email = "test@test.com",
            Name = "Existing User",
            PasswordHash = "hash",
            Role = "therapist"
        };

        var mockUserCollection = new Mock<IMongoCollection<User>>();
        var mockCursor = new Mock<IAsyncCursor<User>>();
        mockCursor.Setup(c => c.Current).Returns(new List<User> { existingUser });
        mockCursor.SetupSequence(c => c.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        mockUserCollection.Setup(c => c.FindAsync(
            It.IsAny<FilterDefinition<User>>(),
            It.IsAny<FindOptions<User, User>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCursor.Object);

        _mockContext.Setup(c => c.Users).Returns(mockUserCollection.Object);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            async () => await _service.RegisterAsync(request));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var password = "password123";
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        var user = new User
        {
            Id = "user-id",
            Email = "test@test.com",
            Name = "Test User",
            PasswordHash = passwordHash,
            Role = "therapist",
            SubscriptionTier = "free"
        };

        var request = new LoginRequest("test@test.com", password);

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

        // Act
        var result = await _service.LoginAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be(user.Email);
        result.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsException()
    {
        // Arrange
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword");

        var user = new User
        {
            Id = "user-id",
            Email = "test@test.com",
            Name = "Test User",
            PasswordHash = passwordHash,
            Role = "therapist"
        };

        var request = new LoginRequest("test@test.com", "wrongpassword");

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

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            async () => await _service.LoginAsync(request));
    }
}

