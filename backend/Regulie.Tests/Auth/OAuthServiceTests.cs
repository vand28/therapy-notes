using Xunit;
using Regulie.Infrastructure.Auth;

namespace Regulie.Tests.Auth;

public class OAuthServiceTests
{
    [Fact]
    public void GoogleAuthService_Constructor_ShouldInitialize()
    {
        // Arrange & Act
        var service = new GoogleAuthService("test-client-id");

        // Assert
        Assert.NotNull(service);
    }

    [Fact]
    public async Task GoogleAuthService_ValidateToken_WithInvalidToken_ShouldThrow()
    {
        // Arrange
        var service = new GoogleAuthService("test-client-id");
        var invalidToken = "invalid-token";

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            async () => await service.ValidateGoogleTokenAsync(invalidToken)
        );
    }

}

