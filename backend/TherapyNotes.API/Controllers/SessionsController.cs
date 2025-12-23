using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Interfaces;

namespace TherapyNotes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;
    private readonly IUsageLimitService _usageLimitService;

    public SessionsController(ISessionService sessionService, IUsageLimitService usageLimitService)
    {
        _sessionService = sessionService;
        _usageLimitService = usageLimitService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
    private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role) ?? throw new UnauthorizedAccessException();

    [HttpPost]
    public async Task<ActionResult<SessionResponse>> CreateSession([FromBody] CreateSessionRequest request)
    {
        try
        {
            var therapistId = GetUserId();
            if (GetUserRole() != "therapist")
                return Forbid();

            // Check usage limits
            if (!await _usageLimitService.CanCreateSessionAsync(therapistId))
                return StatusCode(403, new { message = "Monthly session limit reached. Please upgrade your plan.", code = "LIMIT_REACHED" });

            var session = await _sessionService.CreateSessionAsync(therapistId, request);
            return CreatedAtAction(nameof(GetSession), new { id = session.Id }, session);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SessionResponse>> GetSession(string id)
    {
        try
        {
            var userId = GetUserId();
            var session = await _sessionService.GetSessionByIdAsync(id, userId);

            if (session == null)
                return NotFound(new { message = "Session not found" });

            return Ok(session);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<SessionResponse>>> GetSessions([FromQuery] string clientId)
    {
        try
        {
            if (string.IsNullOrEmpty(clientId))
                return BadRequest(new { message = "clientId is required" });

            var userId = GetUserId();
            var sessions = await _sessionService.GetClientSessionsAsync(clientId, userId);

            return Ok(sessions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SessionResponse>> UpdateSession(string id, [FromBody] UpdateSessionRequest request)
    {
        try
        {
            var therapistId = GetUserId();
            if (GetUserRole() != "therapist")
                return Forbid();

            var session = await _sessionService.UpdateSessionAsync(id, therapistId, request);

            if (session == null)
                return NotFound(new { message = "Session not found" });

            return Ok(session);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(string id)
    {
        try
        {
            var therapistId = GetUserId();
            if (GetUserRole() != "therapist")
                return Forbid();

            var result = await _sessionService.DeleteSessionAsync(id, therapistId);

            if (!result)
                return NotFound(new { message = "Session not found" });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpPatch("{id}/activities/{activityIndex}")]
    public async Task<IActionResult> UpdateHomeActivity(string id, int activityIndex, [FromBody] UpdateHomeActivityRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _sessionService.UpdateHomeActivityAsync(id, userId, activityIndex, request.CompletedByParent, request.ParentNotes);

            if (!result)
                return NotFound(new { message = "Session or activity not found" });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }
}

public record UpdateHomeActivityRequest(bool CompletedByParent, string ParentNotes);

