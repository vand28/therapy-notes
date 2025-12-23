using Xunit;
using FluentAssertions;
using TherapyNotes.Core.Models;

namespace TherapyNotes.Tests;

public class ClientModelTests
{
    [Fact]
    public void Client_NewInstance_HasEmptyParentUserIds()
    {
        // Arrange & Act
        var client = new Client();

        // Assert
        client.ParentUserIds.Should().NotBeNull();
        client.ParentUserIds.Should().BeEmpty();
    }

    [Fact]
    public void Client_AddGoal_SuccessfullyAddsGoal()
    {
        // Arrange
        var client = new Client
        {
            Name = "Test Client",
            TherapistId = "therapist-id"
        };

        var goal = new ClientGoal
        {
            Description = "Improve communication",
            TargetDate = DateTime.UtcNow.AddMonths(3),
            CurrentLevel = 50
        };

        // Act
        client.Goals.Add(goal);

        // Assert
        client.Goals.Should().HaveCount(1);
        client.Goals[0].Description.Should().Be("Improve communication");
        client.Goals[0].CurrentLevel.Should().Be(50);
    }

    [Fact]
    public void ClientGoal_NewInstance_HasDefaultValues()
    {
        // Arrange & Act
        var goal = new ClientGoal();

        // Assert
        goal.GoalId.Should().NotBeNullOrEmpty();
        goal.CurrentLevel.Should().Be(0);
        goal.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }
}

public class SessionModelTests
{
    [Fact]
    public void Session_NewInstance_HasEmptyHomeActivities()
    {
        // Arrange & Act
        var session = new Session();

        // Assert
        session.HomeActivities.Should().NotBeNull();
        session.HomeActivities.Should().BeEmpty();
    }

    [Fact]
    public void Session_AddHomeActivity_SuccessfullyAdds()
    {
        // Arrange
        var session = new Session
        {
            ClientId = "client-id",
            TherapistId = "therapist-id",
            SessionDate = DateTime.UtcNow
        };

        var activity = new HomeActivity
        {
            Activity = "Practice counting",
            Instructions = "Count to 10 twice daily"
        };

        // Act
        session.HomeActivities.Add(activity);

        // Assert
        session.HomeActivities.Should().HaveCount(1);
        session.HomeActivities[0].Activity.Should().Be("Practice counting");
        session.HomeActivities[0].CompletedByParent.Should().BeFalse();
    }

    [Fact]
    public void HomeActivity_MarkComplete_UpdatesCompletedStatus()
    {
        // Arrange
        var activity = new HomeActivity
        {
            Activity = "Test activity",
            CompletedByParent = false
        };

        // Act
        activity.CompletedByParent = true;
        activity.ParentNotes = "Completed successfully";

        // Assert
        activity.CompletedByParent.Should().BeTrue();
        activity.ParentNotes.Should().Be("Completed successfully");
    }
}

public class UserModelTests
{
    [Fact]
    public void User_NewTherapist_HasFreeSubscriptionByDefault()
    {
        // Arrange & Act
        var user = new User
        {
            Email = "therapist@test.com",
            Name = "Test Therapist",
            Role = "therapist",
            PasswordHash = "hash"
        };

        // Assert
        user.SubscriptionTier.Should().Be("free");
        user.Role.Should().Be("therapist");
    }

    [Fact]
    public void User_ParentRole_CanBeCreated()
    {
        // Arrange & Act
        var user = new User
        {
            Email = "parent@test.com",
            Name = "Test Parent",
            Role = "parent",
            PasswordHash = "hash"
        };

        // Assert
        user.Role.Should().Be("parent");
    }
}
