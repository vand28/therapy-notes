using Xunit;
using TherapyNotes.Infrastructure.Auth;

namespace TherapyNotes.Tests.Auth;

public class MfaServiceTests
{
    private readonly MfaService _mfaService;

    public MfaServiceTests()
    {
        _mfaService = new MfaService();
    }

    [Fact]
    public void GenerateSecret_ShouldReturnNonEmptyString()
    {
        // Act
        var secret = _mfaService.GenerateSecret();

        // Assert
        Assert.NotNull(secret);
        Assert.NotEmpty(secret);
        Assert.True(secret.Length > 20);
    }

    [Fact]
    public void GenerateQrCodeUri_ShouldReturnValidUri()
    {
        // Arrange
        var email = "test@example.com";
        var secret = _mfaService.GenerateSecret();

        // Act
        var uri = _mfaService.GenerateQrCodeUri(email, secret);

        // Assert
        Assert.StartsWith("otpauth://totp/", uri);
        Assert.Contains(email, uri);
        Assert.Contains(secret, uri);
    }

    [Fact]
    public void GenerateQrCodeImage_ShouldReturnByteArray()
    {
        // Arrange
        var email = "test@example.com";
        var secret = _mfaService.GenerateSecret();
        var uri = _mfaService.GenerateQrCodeUri(email, secret);

        // Act
        var image = _mfaService.GenerateQrCodeImage(uri);

        // Assert
        Assert.NotNull(image);
        Assert.True(image.Length > 0);
    }

    [Fact]
    public void ValidateTotp_WithValidCode_ShouldReturnTrue()
    {
        // Arrange
        var secret = _mfaService.GenerateSecret();
        var totp = new OtpNet.Totp(OtpNet.Base32Encoding.ToBytes(secret));
        var code = totp.ComputeTotp();

        // Act
        var isValid = _mfaService.ValidateTotp(secret, code);

        // Assert
        Assert.True(isValid);
    }

    [Fact]
    public void ValidateTotp_WithInvalidCode_ShouldReturnFalse()
    {
        // Arrange
        var secret = _mfaService.GenerateSecret();
        var invalidCode = "000000";

        // Act
        var isValid = _mfaService.ValidateTotp(secret, invalidCode);

        // Assert
        Assert.False(isValid);
    }

    [Fact]
    public void GenerateBackupCodes_ShouldReturnCorrectCount()
    {
        // Act
        var codes = _mfaService.GenerateBackupCodes(10);

        // Assert
        Assert.Equal(10, codes.Count);
        Assert.All(codes, code =>
        {
            Assert.NotNull(code);
            Assert.Matches(@"^[A-Z0-9]{4}-[A-Z0-9]{4}$", code);
        });
    }

    [Fact]
    public void HashBackupCode_ShouldReturnHashedCode()
    {
        // Arrange
        var code = "ABCD-1234";

        // Act
        var hash = _mfaService.HashBackupCode(code);

        // Assert
        Assert.NotNull(hash);
        Assert.NotEqual(code, hash);
        Assert.StartsWith("$2", hash); // BCrypt hash prefix
    }

    [Fact]
    public void VerifyBackupCode_WithValidCode_ShouldReturnTrue()
    {
        // Arrange
        var code = "ABCD-1234";
        var hash = _mfaService.HashBackupCode(code);

        // Act
        var isValid = _mfaService.VerifyBackupCode(code, hash);

        // Assert
        Assert.True(isValid);
    }

    [Fact]
    public void VerifyBackupCode_WithInvalidCode_ShouldReturnFalse()
    {
        // Arrange
        var code = "ABCD-1234";
        var hash = _mfaService.HashBackupCode(code);
        var wrongCode = "WXYZ-9999";

        // Act
        var isValid = _mfaService.VerifyBackupCode(wrongCode, hash);

        // Assert
        Assert.False(isValid);
    }
}

