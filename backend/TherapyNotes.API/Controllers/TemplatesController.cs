using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TherapyNotes.Core.DTOs;
using TherapyNotes.Core.Interfaces;

namespace TherapyNotes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TemplatesController : ControllerBase
{
    private readonly ITemplateService _templateService;

    public TemplatesController(ITemplateService templateService)
    {
        _templateService = templateService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TemplateResponse>>> GetTemplates([FromQuery] string? category = null)
    {
        try
        {
            var templates = string.IsNullOrEmpty(category)
                ? await _templateService.GetAllTemplatesAsync()
                : await _templateService.GetTemplatesByCategoryAsync(category);

            return Ok(templates);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TemplateResponse>> GetTemplate(string id)
    {
        try
        {
            var template = await _templateService.GetTemplateByIdAsync(id);

            if (template == null)
                return NotFound(new { message = "Template not found" });

            return Ok(template);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<TemplateResponse>> CreateTemplate([FromBody] CreateTemplateRequest request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var template = await _templateService.CreateTemplateAsync(userId, request);

            return CreatedAtAction(nameof(GetTemplate), new { id = template.Id }, template);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }
}

