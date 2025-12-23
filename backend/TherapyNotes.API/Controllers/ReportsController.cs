using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using TherapyNotes.Core.Models;
using TherapyNotes.Infrastructure.MongoDB;
using TherapyNotes.Infrastructure.Reports;

namespace TherapyNotes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reportService;
    private readonly MongoDbContext _dbContext;

    public ReportsController(ReportService reportService, MongoDbContext dbContext)
    {
        _reportService = reportService;
        _dbContext = dbContext;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
    private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role) ?? throw new UnauthorizedAccessException();

    [HttpGet("client/{clientId}/progress")]
    public async Task<IActionResult> GenerateProgressReport(string clientId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
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

            // Get sessions
            var start = startDate ?? DateTime.UtcNow.AddMonths(-3);
            var end = endDate ?? DateTime.UtcNow;
            
            var sessions = await _dbContext.Sessions
                .Find(s => s.ClientId == clientId && s.SessionDate >= start && s.SessionDate <= end)
                .ToListAsync();

            // Generate PDF
            var pdfBytes = _reportService.GenerateProgressReport(client, sessions, start, end);

            return File(pdfBytes, "application/pdf", $"{client.Name}-Progress-Report-{DateTime.Now:yyyyMMdd}.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to generate report", error = ex.Message });
        }
    }

    [HttpGet("export-csv")]
    public async Task<IActionResult> ExportToCSV()
    {
        try
        {
            var userId = GetUserId();
            if (GetUserRole() != "therapist")
                return Forbid();

            var clients = await _dbContext.Clients
                .Find(c => c.TherapistId == userId)
                .ToListAsync();

            var csv = new System.Text.StringBuilder();
            csv.AppendLine("Client Name,Date of Birth,Diagnosis,Goals Count,Created Date");

            foreach (var client in clients)
            {
                csv.AppendLine($"\"{client.Name}\",\"{client.DateOfBirth?.ToString("yyyy-MM-dd") ?? "N/A"}\",\"{string.Join("; ", client.Diagnosis)}\",{client.Goals.Count},\"{client.CreatedAt:yyyy-MM-dd}\"");
            }

            var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"TherapyNotes-Export-{DateTime.Now:yyyyMMdd}.csv");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to export data", error = ex.Message });
        }
    }
}

