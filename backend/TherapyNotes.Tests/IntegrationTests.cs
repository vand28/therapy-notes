using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Xunit;
using FluentAssertions;
using TherapyNotes.Core.DTOs;

namespace TherapyNotes.Tests;

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

