using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using TherapyNotes.Core.Interfaces;
using TherapyNotes.Core.Models;
using TherapyNotes.Infrastructure.MongoDB;

namespace TherapyNotes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly IStorageService _storageService;
    private readonly MongoDbContext _dbContext;
    private readonly IUsageLimitService _usageLimitService;

    public MediaController(IStorageService storageService, MongoDbContext dbContext, IUsageLimitService usageLimitService)
    {
        _storageService = storageService;
        _dbContext = dbContext;
        _usageLimitService = usageLimitService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [HttpPost("upload")]
    public async Task<ActionResult<object>> UploadFile([FromForm] IFormFile file, [FromForm] string sessionId)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided" });

            // Check file size (50MB limit)
            if (file.Length > 50 * 1024 * 1024)
                return BadRequest(new { message = "File size exceeds 50MB limit" });

            var userId = GetUserId();

            // Check storage limits
            if (!await _usageLimitService.CanUploadFileAsync(userId, file.Length))
                return StatusCode(403, new { message = "Storage limit reached. Please upgrade your plan.", code = "LIMIT_REACHED" });

            // Verify session belongs to user (therapist)
            var session = await _dbContext.Sessions
                .Find(s => s.Id == sessionId && s.TherapistId == userId)
                .FirstOrDefaultAsync();

            if (session == null)
                return NotFound(new { message = "Session not found" });

            // Upload file to storage
            using var stream = file.OpenReadStream();
            var fileKey = await _storageService.UploadFileAsync(stream, file.FileName, file.ContentType);

            // Add media attachment to session
            var mediaAttachment = new MediaAttachment
            {
                FileKey = fileKey,
                FileName = file.FileName,
                FileType = file.ContentType,
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow
            };

            var filter = Builders<Session>.Filter.Eq(s => s.Id, sessionId);
            var update = Builders<Session>.Update
                .Push(s => s.MediaAttachments, mediaAttachment)
                .Set(s => s.UpdatedAt, DateTime.UtcNow);

            await _dbContext.Sessions.UpdateOneAsync(filter, update);

            // Update storage usage
            await _usageLimitService.UpdateStorageUsageAsync(userId, file.Length);

            return Ok(new
            {
                FileKey = fileKey,
                FileName = file.FileName,
                FileSize = file.Length,
                Message = "File uploaded successfully"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during upload", error = ex.Message });
        }
    }

    [HttpGet("{fileKey}")]
    public async Task<IActionResult> DownloadFile(string fileKey)
    {
        try
        {
            // Get presigned URL instead of streaming (better for S3/R2)
            var url = await _storageService.GetPresignedUrlAsync(fileKey, 60);
            return Ok(new { Url = url });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during download", error = ex.Message });
        }
    }

    [HttpDelete("{fileKey}")]
    public async Task<IActionResult> DeleteFile(string fileKey, [FromQuery] string sessionId)
    {
        try
        {
            var userId = GetUserId();

            // Verify session belongs to user
            var session = await _dbContext.Sessions
                .Find(s => s.Id == sessionId && s.TherapistId == userId)
                .FirstOrDefaultAsync();

            if (session == null)
                return NotFound(new { message = "Session not found" });

            // Delete from storage
            await _storageService.DeleteFileAsync(fileKey);

            // Remove from session
            var filter = Builders<Session>.Filter.Eq(s => s.Id, sessionId);
            var update = Builders<Session>.Update
                .PullFilter(s => s.MediaAttachments, m => m.FileKey == fileKey)
                .Set(s => s.UpdatedAt, DateTime.UtcNow);

            await _dbContext.Sessions.UpdateOneAsync(filter, update);

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during deletion", error = ex.Message });
        }
    }
}

