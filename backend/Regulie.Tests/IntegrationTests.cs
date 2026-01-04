using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Xunit;
using FluentAssertions;
using Regulie.Core.DTOs;

namespace Regulie.Tests;

public class IntegrationTestsBase : IClassFixture<WebApplicationFactory<Program>>
{
    protected readonly HttpClient _client;
    protected string? _authToken;
    protected string? _userId;

    public IntegrationTestsBase(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    protected async Task<(string token, string userId)> RegisterAndLoginTestUserAsync(
        string email = "test@test.com",
        string role = "therapist")
    {
        var registerRequest = new RegisterRequest(
            email,
            "TestPassword123!",
            "Test User",
            role
        );

        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        
        if (registerResponse.StatusCode == HttpStatusCode.BadRequest)
        {
            // User might already exist, try login
            var loginRequest = new LoginRequest(email, "TestPassword123!");
            var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
            loginResponse.EnsureSuccessStatusCode();
            
            var loginResult = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();
            return (loginResult!.Token, loginResult.UserId);
        }

        registerResponse.EnsureSuccessStatusCode();
        var authResult = await registerResponse.Content.ReadFromJsonAsync<AuthResponse>();
        return (authResult!.Token, authResult.UserId);
    }

    protected void SetAuthToken(string token)
    {
        _authToken = token;
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }
}

public class AuthEndpointTests : IntegrationTestsBase
{
    public AuthEndpointTests(WebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task Register_ValidRequest_ReturnsToken()
    {
        // Arrange
        var uniqueEmail = $"test-{Guid.NewGuid()}@test.com";
        var request = new RegisterRequest(
            uniqueEmail,
            "TestPassword123!",
            "Test User",
            "therapist"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrEmpty();
        result.Email.Should().Be(uniqueEmail);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var uniqueEmail = $"test-{Guid.NewGuid()}@test.com";
        await RegisterAndLoginTestUserAsync(uniqueEmail);

        var request = new LoginRequest(uniqueEmail, "TestPassword123!");

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<AuthResponse>();
        result.Should().NotBeNull();
        result!.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_InvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        var uniqueEmail = $"test-{Guid.NewGuid()}@test.com";
        await RegisterAndLoginTestUserAsync(uniqueEmail);

        var request = new LoginRequest(uniqueEmail, "WrongPassword");

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}

public class ClientEndpointTests : IntegrationTestsBase
{
    public ClientEndpointTests(WebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task CreateClient_Authenticated_CreatesClient()
    {
        // Arrange
        var (token, userId) = await RegisterAndLoginTestUserAsync($"therapist-{Guid.NewGuid()}@test.com");
        SetAuthToken(token);

        var request = new CreateClientRequest(
            "Test Client",
            new DateTime(2015, 1, 1),
            new[] { "ASD" }.ToList(),
            "Test diagnosis notes"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/clients", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ClientResponse>();
        result.Should().NotBeNull();
        result!.Name.Should().Be("Test Client");
    }

    [Fact]
    public async Task GetClients_Authenticated_ReturnsClientList()
    {
        // Arrange
        var (token, userId) = await RegisterAndLoginTestUserAsync($"therapist-{Guid.NewGuid()}@test.com");
        SetAuthToken(token);

        // Act
        var response = await _client.GetAsync("/api/clients");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<ClientResponse>>();
        result.Should().NotBeNull();
    }
}

public class UsageEndpointTests : IntegrationTestsBase
{
    public UsageEndpointTests(WebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task GetUsageSummary_Authenticated_ReturnsUsage()
    {
        // Arrange
        var (token, userId) = await RegisterAndLoginTestUserAsync($"therapist-{Guid.NewGuid()}@test.com");
        SetAuthToken(token);

        // Act
        var response = await _client.GetAsync("/api/usage/summary");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<UsageSummaryResponse>();
        result.Should().NotBeNull();
        result!.Limits.Should().NotBeNull();
    }
}

public class MfaEndpointTests : IntegrationTestsBase
{
    public MfaEndpointTests(WebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task SetupMfa_Authenticated_ReturnsSetupData()
    {
        // Arrange
        var (token, userId) = await RegisterAndLoginTestUserAsync($"mfa-test-{Guid.NewGuid()}@test.com");
        SetAuthToken(token);

        // Act
        var response = await _client.PostAsync("/api/auth/mfa/setup", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<MfaSetupResponse>();
        result.Should().NotBeNull();
        result!.Secret.Should().NotBeNullOrEmpty();
        result.QrCodeUri.Should().NotBeNullOrEmpty();
        result.BackupCodes.Should().HaveCountGreaterThan(0);
    }

    [Fact]
    public async Task SetupMfa_Unauthenticated_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.PostAsync("/api/auth/mfa/setup", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task VerifyMfaSetup_WithInvalidCode_ReturnsBadRequest()
    {
        // Arrange
        var (token, userId) = await RegisterAndLoginTestUserAsync($"mfa-verify-{Guid.NewGuid()}@test.com");
        SetAuthToken(token);
        
        // Setup MFA first
        await _client.PostAsync("/api/auth/mfa/setup", null);

        // Act - Try to verify with invalid code
        var verifyRequest = new { Code = "000000" };
        var response = await _client.PostAsJsonAsync("/api/auth/mfa/verify-setup", verifyRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DisableMfa_Authenticated_ReturnsSuccess()
    {
        // Arrange
        var (token, userId) = await RegisterAndLoginTestUserAsync($"mfa-disable-{Guid.NewGuid()}@test.com");
        SetAuthToken(token);

        // Act
        var disableRequest = new { Password = "TestPassword123!" };
        var response = await _client.PostAsJsonAsync("/api/auth/mfa/disable", disableRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}

public class AccessRequestEndpointTests : IntegrationTestsBase
{
    public AccessRequestEndpointTests(WebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task RequestAccess_AsParent_ReturnsSuccess()
    {
        // Arrange
        var (token, userId) = await RegisterAndLoginTestUserAsync($"parent-{Guid.NewGuid()}@test.com", "parent");
        SetAuthToken(token);

        var request = new
        {
            ChildFirstName = "John",
            ChildLastName = "Doe",
            ChildDateOfBirth = "2015-01-01",
            TherapistEmail = "therapist@test.com"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/accessrequests/request-access", request);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound); // NotFound if therapist doesn't exist
    }

    [Fact]
    public async Task GetMyRequests_AsParent_ReturnsRequests()
    {
        // Arrange
        var (token, userId) = await RegisterAndLoginTestUserAsync($"parent-requests-{Guid.NewGuid()}@test.com", "parent");
        SetAuthToken(token);

        // Act
        var response = await _client.GetAsync("/api/accessrequests/my-requests");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<AccessRequestResponse>>();
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task GetPendingRequests_AsTherapist_ReturnsRequests()
    {
        // Arrange
        var (token, userId) = await RegisterAndLoginTestUserAsync($"therapist-pending-{Guid.NewGuid()}@test.com", "therapist");
        SetAuthToken(token);

        // Act
        var response = await _client.GetAsync("/api/accessrequests/pending");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<List<AccessRequestResponse>>();
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task RequestAccess_AsTherapist_ReturnsBadRequest()
    {
        // Arrange
        var (token, userId) = await RegisterAndLoginTestUserAsync($"therapist-wrong-role-{Guid.NewGuid()}@test.com", "therapist");
        SetAuthToken(token);

        var request = new
        {
            ChildFirstName = "John",
            ChildLastName = "Doe",
            ChildDateOfBirth = "2015-01-01",
            TherapistEmail = "therapist@test.com"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/accessrequests/request-access", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}

// DTOs for tests
public record MfaSetupResponse(string Secret, string QrCodeUri, byte[] QrCodeImage, List<string> BackupCodes);
public record UsageSummaryResponse(UsageLimits Limits, UsageStats Current);
public record UsageLimits(int MaxClients, int MaxSessionsPerMonth, double MaxStorageMB);
public record UsageStats(int ClientCount, int SessionsThisMonth, double StorageUsedMB);
public record AccessRequestResponse(
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

