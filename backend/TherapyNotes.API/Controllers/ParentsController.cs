using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using TherapyNotes.Core.Models;
using TherapyNotes.Infrastructure.MongoDB;

namespace TherapyNotes.API.Controllers;

[ApiController]
[Route("api/clients/{clientId}/[controller]")]
[Authorize]
public class ParentsController : ControllerBase
{
    private readonly MongoDbContext _dbContext;

    public ParentsController(MongoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
    private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role) ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<List<object>>> GetLinkedParents(string clientId)
    {
        try
        {
            var userId = GetUserId();
            
            // Verify client belongs to therapist
            var client = await _dbContext.Clients
                .Find(c => c.Id == clientId && c.TherapistId == userId)
                .FirstOrDefaultAsync();
                
            if (client == null)
                return NotFound(new { message = "Client not found" });

            // Get parent users
            var parents = await _dbContext.Users
                .Find(u => client.ParentUserIds.Contains(u.Id))
                .ToListAsync();

            return Ok(parents.Select(p => new
            {
                p.Id,
                p.Name,
                p.Email,
                p.CreatedAt
            }));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpDelete("{parentId}")]
    public async Task<IActionResult> RemoveParent(string clientId, string parentId)
    {
        try
        {
            var userId = GetUserId();
            
            if (GetUserRole() != "therapist")
                return Forbid();

            // Verify client belongs to therapist
            var client = await _dbContext.Clients
                .Find(c => c.Id == clientId && c.TherapistId == userId)
                .FirstOrDefaultAsync();
                
            if (client == null)
                return NotFound(new { message = "Client not found" });

            // Remove parent from client
            var filter = Builders<Client>.Filter.Eq(c => c.Id, clientId);
            var update = Builders<Client>.Update
                .Pull(c => c.ParentUserIds, parentId)
                .Set(c => c.UpdatedAt, DateTime.UtcNow);

            await _dbContext.Clients.UpdateOneAsync(filter, update);

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }
}

