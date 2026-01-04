using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using Regulie.Core.DTOs;
using Regulie.Core.Interfaces;
using Regulie.Core.Models;
using Regulie.Infrastructure.Email;
using Regulie.Infrastructure.MongoDB;

namespace Regulie.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IClientService _clientService;
    private readonly MongoDbContext _dbContext;
    private readonly ResendEmailService? _emailService;

    public AuthController(
        IAuthService authService, 
        IClientService clientService,
        MongoDbContext dbContext,
        ResendEmailService? emailService = null)
    {
        _authService = authService;
        _clientService = clientService;
        _dbContext = dbContext;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("invite-parent")]
    public async Task<ActionResult<AuthResponse>> InviteParent([FromBody] InviteParentRequest request)
    {
        try
        {
            var therapistId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Verify client belongs to therapist
            var client = await _dbContext.Clients
                .Find(c => c.Id == request.ClientId && c.TherapistId == therapistId)
                .FirstOrDefaultAsync();
                
            if (client == null)
                return NotFound(new { message = "Client not found" });

            // Check if parent already exists
            var existingParent = await _authService.GetUserByEmailAsync(request.ParentEmail);
            string parentUserId;
            string tempPassword = string.Empty;

            if (existingParent != null)
            {
                // Parent user already exists
                parentUserId = existingParent.Id;
                
                // Link parent to client if not already linked
                if (!client.ParentUserIds.Contains(parentUserId))
                {
                    var filter = Builders<Client>.Filter.Eq(c => c.Id, request.ClientId);
                    var update = Builders<Client>.Update
                        .Push(c => c.ParentUserIds, parentUserId)
                        .Set(c => c.UpdatedAt, DateTime.UtcNow);
                    await _dbContext.Clients.UpdateOneAsync(filter, update);
                }
            }
            else
            {
                // Create new parent account
                tempPassword = Guid.NewGuid().ToString()[..8];
                
                var registerRequest = new RegisterRequest(
                    request.ParentEmail,
                    tempPassword,
                    request.ParentName,
                    "parent"
                );

                var response = await _authService.RegisterAsync(registerRequest);
                parentUserId = response.UserId;

                // Link new parent to client
                var filter = Builders<Client>.Filter.Eq(c => c.Id, request.ClientId);
                var update = Builders<Client>.Update
                    .Push(c => c.ParentUserIds, parentUserId)
                    .Set(c => c.UpdatedAt, DateTime.UtcNow);
                await _dbContext.Clients.UpdateOneAsync(filter, update);
            }

            // Send email if email service is configured
            if (_emailService != null && !string.IsNullOrEmpty(tempPassword))
            {
                try
                {
                    await _emailService.SendParentInviteAsync(
                        request.ParentEmail,
                        request.ParentName,
                        client.Name,
                        tempPassword
                    );
                    
                    // ALWAYS return password so therapist can see it
                    return Ok(new
                    {
                        ParentUserId = parentUserId,
                        Email = request.ParentEmail,
                        Name = request.ParentName,
                        TemporaryPassword = tempPassword,
                        Message = "Parent linked to client. Invitation email sent with temporary password."
                    });
                }
                catch (Exception emailEx)
                {
                    // Email failed but account created and linked
                    return Ok(new
                    {
                        ParentUserId = parentUserId,
                        Email = request.ParentEmail,
                        Name = request.ParentName,
                        TemporaryPassword = tempPassword,
                        Message = $"Parent linked to client. Email failed: {emailEx.Message}. Please share the temporary password manually."
                    });
                }
            }
            else
            {
                // No email service or existing parent
                return Ok(new
                {
                    ParentUserId = parentUserId,
                    Email = request.ParentEmail,
                    Name = request.ParentName,
                    TemporaryPassword = !string.IsNullOrEmpty(tempPassword) ? tempPassword : null,
                    Message = existingParent != null 
                        ? "Existing parent linked to client." 
                        : "Parent account created and linked. Please share the temporary password with the parent."
                });
            }
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while inviting parent", error = ex.Message });
        }
    }

    [HttpPost("google")]
    public async Task<ActionResult<OAuthAuthResponse>> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            var response = await _authService.GoogleLoginAsync(request.IdToken, request.Role);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during Google login", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("mfa/setup")]
    public async Task<ActionResult<MfaSetupResponse>> SetupMfa()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var response = await _authService.SetupMfaAsync(userId);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during MFA setup", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("mfa/verify-setup")]
    public async Task<ActionResult> VerifyMfaSetup([FromBody] VerifyMfaSetupRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var isValid = await _authService.VerifyMfaSetupAsync(userId, request.Code);
            
            if (isValid)
            {
                return Ok(new { message = "MFA enabled successfully" });
            }
            else
            {
                return BadRequest(new { message = "Invalid verification code" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during MFA verification", error = ex.Message });
        }
    }

    [HttpPost("mfa/verify")]
    public async Task<ActionResult<AuthResponse>> VerifyMfa([FromBody] MfaVerifyRequest request)
    {
        try
        {
            var response = await _authService.VerifyMfaAsync(request.TempToken, request.Code, request.IsBackupCode);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during MFA verification", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("mfa/disable")]
    public async Task<ActionResult> DisableMfa([FromBody] DisableMfaRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var success = await _authService.DisableMfaAsync(userId, request.Password);
            
            if (success)
            {
                return Ok(new { message = "MFA disabled successfully" });
            }
            else
            {
                return BadRequest(new { message = "Failed to disable MFA" });
            }
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while disabling MFA", error = ex.Message });
        }
    }
}

