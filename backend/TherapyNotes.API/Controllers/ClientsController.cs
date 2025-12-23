using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Interfaces;

namespace TherapyNotes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;
    private readonly IUsageLimitService _usageLimitService;

    public ClientsController(IClientService clientService, IUsageLimitService usageLimitService)
    {
        _clientService = clientService;
        _usageLimitService = usageLimitService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
    private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role) ?? throw new UnauthorizedAccessException();

    [HttpPost]
    public async Task<ActionResult<ClientResponse>> CreateClient([FromBody] CreateClientRequest request)
    {
        try
        {
            var therapistId = GetUserId();
            if (GetUserRole() != "therapist")
                return Forbid();

            // Check usage limits
            if (!await _usageLimitService.CanCreateClientAsync(therapistId))
                return StatusCode(403, new { message = "Client limit reached. Please upgrade your plan.", code = "LIMIT_REACHED" });

            var client = await _clientService.CreateClientAsync(therapistId, request);
            return CreatedAtAction(nameof(GetClient), new { id = client.Id }, client);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ClientResponse>> GetClient(string id)
    {
        try
        {
            var userId = GetUserId();
            var client = await _clientService.GetClientByIdAsync(id, userId);

            if (client == null)
                return NotFound(new { message = "Client not found" });

            return Ok(client);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<ClientResponse>>> GetClients()
    {
        try
        {
            var userId = GetUserId();
            var role = GetUserRole();

            List<ClientResponse> clients;
            
            if (role == "therapist")
            {
                clients = await _clientService.GetTherapistClientsAsync(userId);
            }
            else if (role == "parent")
            {
                clients = await _clientService.GetParentLinkedClientsAsync(userId);
            }
            else
            {
                return Forbid();
            }

            return Ok(clients);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ClientResponse>> UpdateClient(string id, [FromBody] UpdateClientRequest request)
    {
        try
        {
            var therapistId = GetUserId();
            if (GetUserRole() != "therapist")
                return Forbid();

            var client = await _clientService.UpdateClientAsync(id, therapistId, request);

            if (client == null)
                return NotFound(new { message = "Client not found" });

            return Ok(client);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClient(string id)
    {
        try
        {
            var therapistId = GetUserId();
            if (GetUserRole() != "therapist")
                return Forbid();

            var result = await _clientService.DeleteClientAsync(id, therapistId);

            if (!result)
                return NotFound(new { message = "Client not found" });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpPost("{id}/goals")]
    public async Task<ActionResult<ClientGoalDto>> AddGoal(string id, [FromBody] AddGoalRequest request)
    {
        try
        {
            var therapistId = GetUserId();
            if (GetUserRole() != "therapist")
                return Forbid();

            request = request with { ClientId = id };
            var goal = await _clientService.AddGoalAsync(id, therapistId, request);

            return CreatedAtAction(nameof(GetClient), new { id }, goal);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpPut("{clientId}/goals/{goalId}")]
    public async Task<IActionResult> UpdateGoal(string clientId, string goalId, [FromBody] UpdateGoalRequest request)
    {
        try
        {
            var therapistId = GetUserId();
            if (GetUserRole() != "therapist")
                return Forbid();

            var result = await _clientService.UpdateGoalAsync(clientId, goalId, therapistId, request);

            if (!result)
                return NotFound(new { message = "Goal or client not found" });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpDelete("{clientId}/goals/{goalId}")]
    public async Task<IActionResult> DeleteGoal(string clientId, string goalId)
    {
        try
        {
            var therapistId = GetUserId();
            if (GetUserRole() != "therapist")
                return Forbid();

            var result = await _clientService.DeleteGoalAsync(clientId, goalId, therapistId);

            if (!result)
                return NotFound(new { message = "Goal or client not found" });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpPatch("{clientId}/goals/{goalId}/progress")]
    public async Task<IActionResult> UpdateGoalProgress(string clientId, string goalId, [FromBody] UpdateGoalProgressRequest request)
    {
        try
        {
            var userId = GetUserId();
            
            // Allow both therapists and parents to update progress manually if needed
            var result = await _clientService.UpdateGoalProgressAsync(clientId, goalId, request.NewLevel);

            if (!result)
                return NotFound(new { message = "Goal or client not found" });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }
}

