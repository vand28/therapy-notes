using Google.Apis.Auth;
using TherapyNotes.Core.Interfaces;

namespace TherapyNotes.Infrastructure.Auth;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly string _clientId;

    public GoogleAuthService(string clientId)
    {
        _clientId = clientId;
    }

    public async Task<GoogleJsonWebSignature.Payload> ValidateGoogleTokenAsync(string idToken)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _clientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            return payload;
        }
        catch (InvalidJwtException ex)
        {
            throw new UnauthorizedAccessException("Invalid Google token", ex);
        }
    }
}

