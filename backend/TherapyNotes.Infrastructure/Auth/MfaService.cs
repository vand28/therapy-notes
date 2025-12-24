using System.Security.Cryptography;
using OtpNet;
using QRCoder;
using TherapyNotes.Core.Interfaces;

namespace TherapyNotes.Infrastructure.Auth;

public class MfaService : IMfaService
{
    private const int SecretLength = 32;
    private const int BackupCodeLength = 8;

    public string GenerateSecret()
    {
        var secretBytes = new byte[SecretLength];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(secretBytes);
        }
        return Base32Encoding.ToString(secretBytes);
    }

    public string GenerateQrCodeUri(string userEmail, string secret, string issuer = "TherapyNotes")
    {
        return $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(userEmail)}?secret={secret}&issuer={Uri.EscapeDataString(issuer)}";
    }

    public byte[] GenerateQrCodeImage(string uri)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(uri, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }

    public bool ValidateTotp(string secret, string code)
    {
        try
        {
            var secretBytes = Base32Encoding.ToBytes(secret);
            var totp = new Totp(secretBytes);
            
            // Check current code and allow for time drift (±1 time step = 30 seconds)
            var currentCode = totp.ComputeTotp();
            if (code == currentCode)
                return true;

            var previousCode = totp.ComputeTotp(DateTime.UtcNow.AddSeconds(-30));
            if (code == previousCode)
                return true;

            var nextCode = totp.ComputeTotp(DateTime.UtcNow.AddSeconds(30));
            if (code == nextCode)
                return true;

            return false;
        }
        catch
        {
            return false;
        }
    }

    public List<string> GenerateBackupCodes(int count = 10)
    {
        var codes = new List<string>();
        for (int i = 0; i < count; i++)
        {
            codes.Add(GenerateBackupCode());
        }
        return codes;
    }

    public string HashBackupCode(string code)
    {
        return BCrypt.Net.BCrypt.HashPassword(code);
    }

    public bool VerifyBackupCode(string code, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(code, hash);
    }

    private string GenerateBackupCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var codeBytes = new byte[BackupCodeLength];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(codeBytes);
        }

        var code = new char[BackupCodeLength];
        for (int i = 0; i < BackupCodeLength; i++)
        {
            code[i] = chars[codeBytes[i] % chars.Length];
        }

        // Format as XXXX-XXXX
        return $"{new string(code, 0, 4)}-{new string(code, 4, 4)}";
    }
}

