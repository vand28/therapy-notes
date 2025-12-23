using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Interfaces;

namespace TherapyNotes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsageController : ControllerBase
{
    private readonly IUsageLimitService _usageLimitService;

    public UsageController(IUsageLimitService usageLimitService)
    {
        _usageLimitService = usageLimitService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [HttpGet("summary")]
    public async Task<ActionResult<UsageSummaryResponse>> GetUsageSummary()
    {
        try
        {
            var userId = GetUserId();
            var summary = await _usageLimitService.GetUsageSummaryAsync(userId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }
}

