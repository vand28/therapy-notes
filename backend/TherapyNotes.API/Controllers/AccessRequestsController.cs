using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Models;
using TherapyNotes.Infrastructure.Email;
using TherapyNotes.Infrastructure.MongoDB;

namespace TherapyNotes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccessRequestsController : ControllerBase
{
    private readonly MongoDbContext _dbContext;
    private readonly ResendEmailService? _emailService;

    public AccessRequestsController(MongoDbContext dbContext, ResendEmailService? emailService = null)
    {
        _dbContext = dbContext;
        _emailService = emailService;
    }

    [HttpPost("request-access")]
    public async Task<ActionResult> RequestAccess([FromBody] CreateAccessRequestDto request)
    {
        var parentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var parentEmail = User.FindFirstValue(ClaimTypes.Email);
        var parentName = User.FindFirstValue(ClaimTypes.Name);
        var parentRole = User.FindFirstValue(ClaimTypes.Role);

        if (parentRole != "parent")
        {
            return BadRequest(new { message = "Only parent users can request access" });
        }

        // Check if therapist exists
        var therapist = await _dbContext.Users
            .Find(u => u.Email == request.TherapistEmail && u.Role == "therapist")
            .FirstOrDefaultAsync();

        if (therapist == null)
        {
            return NotFound(new { message = "Therapist not found with this email" });
        }

        // Check for existing pending request
        var existingRequest = await _dbContext.AccessRequests
            .Find(ar => ar.ParentUserId == parentUserId 
                && ar.TherapistEmail == request.TherapistEmail
                && ar.ChildFirstName == request.ChildFirstName
                && ar.ChildLastName == request.ChildLastName
                && ar.Status == "pending")
            .FirstOrDefaultAsync();

        if (existingRequest != null)
        {
            return BadRequest(new { message = "You already have a pending request for this child with this therapist" });
        }

        var accessRequest = new AccessRequest
        {
            ParentUserId = parentUserId!,
            ParentEmail = parentEmail!,
            ParentName = parentName!,
            ChildFirstName = request.ChildFirstName,
            ChildLastName = request.ChildLastName,
            ChildDateOfBirth = request.ChildDateOfBirth,
            TherapistEmail = request.TherapistEmail,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _dbContext.AccessRequests.InsertOneAsync(accessRequest);

        // Send email notification to therapist
        if (_emailService != null)
        {
            try
            {
                await _emailService.SendAccessRequestNotificationAsync(
                    therapist.Email,
                    therapist.Name,
                    parentName!,
                    $"{request.ChildFirstName} {request.ChildLastName}"
                );
            }
            catch (Exception ex)
            {
                // Log email error but don't fail the request
                Console.WriteLine($"Failed to send email notification: {ex.Message}");
            }
        }

        return Ok(new { message = "Access request submitted successfully", requestId = accessRequest.Id });
    }

    [HttpGet("my-requests")]
    public async Task<ActionResult<List<AccessRequestResponseDto>>> GetMyRequests()
    {
        var parentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var parentRole = User.FindFirstValue(ClaimTypes.Role);

        if (parentRole != "parent")
        {
            return BadRequest(new { message = "Only parent users can view their requests" });
        }

        var requests = await _dbContext.AccessRequests
            .Find(ar => ar.ParentUserId == parentUserId)
            .SortByDescending(ar => ar.CreatedAt)
            .ToListAsync();

        var response = requests.Select(ar => new AccessRequestResponseDto(
            ar.Id,
            ar.ParentUserId,
            ar.ParentEmail,
            ar.ParentName,
            ar.ChildFirstName,
            ar.ChildLastName,
            ar.ChildDateOfBirth,
            ar.TherapistEmail,
            ar.Status,
            ar.LinkedClientId,
            ar.RejectionReason,
            ar.CreatedAt,
            ar.UpdatedAt
        )).ToList();

        return Ok(response);
    }

    [HttpGet("pending")]
    public async Task<ActionResult<List<AccessRequestResponseDto>>> GetPendingRequests()
    {
        var therapistEmail = User.FindFirstValue(ClaimTypes.Email);
        var therapistRole = User.FindFirstValue(ClaimTypes.Role);

        if (therapistRole != "therapist")
        {
            return BadRequest(new { message = "Only therapists can view pending requests" });
        }

        var requests = await _dbContext.AccessRequests
            .Find(ar => ar.TherapistEmail == therapistEmail && ar.Status == "pending")
            .SortBy(ar => ar.CreatedAt)
            .ToListAsync();

        var response = requests.Select(ar => new AccessRequestResponseDto(
            ar.Id,
            ar.ParentUserId,
            ar.ParentEmail,
            ar.ParentName,
            ar.ChildFirstName,
            ar.ChildLastName,
            ar.ChildDateOfBirth,
            ar.TherapistEmail,
            ar.Status,
            ar.LinkedClientId,
            ar.RejectionReason,
            ar.CreatedAt,
            ar.UpdatedAt
        )).ToList();

        return Ok(response);
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult> ApproveRequest(string id, [FromBody] ApproveAccessRequestDto dto)
    {
        var therapistId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var therapistEmail = User.FindFirstValue(ClaimTypes.Email);
        var therapistRole = User.FindFirstValue(ClaimTypes.Role);

        if (therapistRole != "therapist")
        {
            return BadRequest(new { message = "Only therapists can approve requests" });
        }

        // Get the access request
        var accessRequest = await _dbContext.AccessRequests
            .Find(ar => ar.Id == id && ar.TherapistEmail == therapistEmail && ar.Status == "pending")
            .FirstOrDefaultAsync();

        if (accessRequest == null)
        {
            return NotFound(new { message = "Access request not found or already processed" });
        }

        // Verify client belongs to therapist
        var client = await _dbContext.Clients
            .Find(c => c.Id == dto.ClientId && c.TherapistId == therapistId)
            .FirstOrDefaultAsync();

        if (client == null)
        {
            return NotFound(new { message = "Client not found" });
        }

        // Link parent to client
        if (!client.ParentUserIds.Contains(accessRequest.ParentUserId))
        {
            var clientFilter = Builders<Client>.Filter.Eq(c => c.Id, dto.ClientId);
            var clientUpdate = Builders<Client>.Update.Push(c => c.ParentUserIds, accessRequest.ParentUserId);
            await _dbContext.Clients.UpdateOneAsync(clientFilter, clientUpdate);
        }

        // Update parent's linked clients
        var parentFilter = Builders<User>.Filter.Eq(u => u.Id, accessRequest.ParentUserId);
        var parentUpdate = Builders<User>.Update.AddToSet(u => u.LinkedClientIds, dto.ClientId);
        await _dbContext.Users.UpdateOneAsync(parentFilter, parentUpdate);

        // Update access request status
        var requestFilter = Builders<AccessRequest>.Filter.Eq(ar => ar.Id, id);
        var requestUpdate = Builders<AccessRequest>.Update
            .Set(ar => ar.Status, "approved")
            .Set(ar => ar.LinkedClientId, dto.ClientId)
            .Set(ar => ar.UpdatedAt, DateTime.UtcNow);
        await _dbContext.AccessRequests.UpdateOneAsync(requestFilter, requestUpdate);

        // Send email notification to parent
        if (_emailService != null)
        {
            try
            {
                await _emailService.SendAccessApprovedNotificationAsync(
                    accessRequest.ParentEmail,
                    accessRequest.ParentName,
                    $"{accessRequest.ChildFirstName} {accessRequest.ChildLastName}"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email notification: {ex.Message}");
            }
        }

        return Ok(new { message = "Access request approved successfully" });
    }

    [HttpPost("{id}/reject")]
    public async Task<ActionResult> RejectRequest(string id, [FromBody] RejectAccessRequestDto? dto = null)
    {
        var therapistEmail = User.FindFirstValue(ClaimTypes.Email);
        var therapistRole = User.FindFirstValue(ClaimTypes.Role);

        if (therapistRole != "therapist")
        {
            return BadRequest(new { message = "Only therapists can reject requests" });
        }

        // Get the access request
        var accessRequest = await _dbContext.AccessRequests
            .Find(ar => ar.Id == id && ar.TherapistEmail == therapistEmail && ar.Status == "pending")
            .FirstOrDefaultAsync();

        if (accessRequest == null)
        {
            return NotFound(new { message = "Access request not found or already processed" });
        }

        // Update access request status
        var filter = Builders<AccessRequest>.Filter.Eq(ar => ar.Id, id);
        var update = Builders<AccessRequest>.Update
            .Set(ar => ar.Status, "rejected")
            .Set(ar => ar.RejectionReason, dto?.Reason)
            .Set(ar => ar.UpdatedAt, DateTime.UtcNow);
        await _dbContext.AccessRequests.UpdateOneAsync(filter, update);

        // Send email notification to parent
        if (_emailService != null)
        {
            try
            {
                await _emailService.SendAccessRejectedNotificationAsync(
                    accessRequest.ParentEmail,
                    accessRequest.ParentName,
                    $"{accessRequest.ChildFirstName} {accessRequest.ChildLastName}",
                    dto?.Reason
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email notification: {ex.Message}");
            }
        }

        return Ok(new { message = "Access request rejected" });
    }
}

public record RejectAccessRequestDto(string? Reason);

