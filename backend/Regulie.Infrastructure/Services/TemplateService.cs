using MongoDB.Driver;
using Regulie.Core.DTOs;
using Regulie.Core.Interfaces;
using Regulie.Core.Models;
using Regulie.Infrastructure.MongoDB;

namespace Regulie.Infrastructure.Services;

public class TemplateService : ITemplateService
{
    private readonly MongoDbContext _dbContext;

    public TemplateService(MongoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TemplateResponse> CreateTemplateAsync(string? createdBy, CreateTemplateRequest request)
    {
        var template = new Template
        {
            Name = request.Name,
            Category = request.Category,
            Description = request.Description ?? string.Empty,
            Activities = request.Activities ?? new List<string>(),
            CommonGoals = request.CommonGoals ?? new List<string>(),
            IsSystemTemplate = createdBy == null,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.Templates.InsertOneAsync(template);

        return MapToResponse(template);
    }

    public async Task<TemplateResponse?> GetTemplateByIdAsync(string templateId)
    {
        var template = await _dbContext.Templates
            .Find(t => t.Id == templateId)
            .FirstOrDefaultAsync();

        return template != null ? MapToResponse(template) : null;
    }

    public async Task<List<TemplateResponse>> GetAllTemplatesAsync()
    {
        var templates = await _dbContext.Templates
            .Find(_ => true)
            .SortBy(t => t.Category)
            .ThenByDescending(t => t.UsageCount)
            .ToListAsync();

        return templates.Select(MapToResponse).ToList();
    }

    public async Task<List<TemplateResponse>> GetTemplatesByCategoryAsync(string category)
    {
        var templates = await _dbContext.Templates
            .Find(t => t.Category == category)
            .SortByDescending(t => t.UsageCount)
            .ToListAsync();

        return templates.Select(MapToResponse).ToList();
    }

    public async Task IncrementUsageAsync(string templateId)
    {
        var filter = Builders<Template>.Filter.Eq(t => t.Id, templateId);
        var update = Builders<Template>.Update.Inc(t => t.UsageCount, 1);

        await _dbContext.Templates.UpdateOneAsync(filter, update);
    }

    public async Task SeedSystemTemplatesAsync()
    {
        var existingCount = await _dbContext.Templates.CountDocumentsAsync(t => t.IsSystemTemplate);
        if (existingCount > 0) return; // Already seeded

        var systemTemplates = new List<Template>
        {
            new()
            {
                Name = "Fine Motor Skills Session",
                Category = "fine-motor",
                Description = "Focus on hand strength, dexterity, and precision movements",
                Activities = new()
                {
                    "Putty work (pinch, roll, squeeze)",
                    "Scissor skills (cutting shapes)",
                    "Bead threading",
                    "Playdough manipulation",
                    "Tweezers and tongs practice",
                    "Pencil grip exercises",
                    "Drawing/coloring activities"
                },
                CommonGoals = new()
                {
                    "Improve tripod grasp",
                    "Increase hand strength",
                    "Develop bilateral coordination",
                    "Master scissor cutting skills"
                },
                IsSystemTemplate = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Name = "Sensory Integration Session",
                Category = "sensory",
                Description = "Address sensory processing and regulation",
                Activities = new()
                {
                    "Sensory bin exploration",
                    "Swinging/vestibular input",
                    "Deep pressure activities",
                    "Tactile play (textures)",
                    "Body awareness games",
                    "Calming techniques",
                    "Heavy work activities"
                },
                CommonGoals = new()
                {
                    "Improve sensory modulation",
                    "Increase tolerance to textures",
                    "Develop self-regulation skills",
                    "Reduce sensory seeking behaviors"
                },
                IsSystemTemplate = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Name = "Communication & Social Skills",
                Category = "communication",
                Description = "Work on verbal/non-verbal communication and social interaction",
                Activities = new()
                {
                    "Turn-taking games",
                    "Eye contact practice",
                    "Picture communication",
                    "Role-playing scenarios",
                    "Conversation starters",
                    "Emotion recognition",
                    "Social stories"
                },
                CommonGoals = new()
                {
                    "Maintain eye contact during greetings",
                    "Take turns appropriately",
                    "Express needs verbally",
                    "Recognize emotions in others"
                },
                IsSystemTemplate = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Name = "Gross Motor Development",
                Category = "gross-motor",
                Description = "Build strength, balance, and coordination",
                Activities = new()
                {
                    "Ball play (throwing, catching, kicking)",
                    "Balance beam walking",
                    "Jumping activities",
                    "Climbing obstacles",
                    "Bicycle/scooter riding",
                    "Animal walks",
                    "Dance/movement games"
                },
                CommonGoals = new()
                {
                    "Improve balance and stability",
                    "Increase core strength",
                    "Master bilateral coordination",
                    "Develop motor planning skills"
                },
                IsSystemTemplate = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Name = "Self-Care & Daily Living",
                Category = "self-care",
                Description = "Practice independence in daily routines",
                Activities = new()
                {
                    "Dressing practice (buttons, zippers)",
                    "Eating skills (utensils, drinking)",
                    "Hand washing routine",
                    "Tooth brushing simulation",
                    "Organizing belongings",
                    "Following multi-step directions",
                    "Time management activities"
                },
                CommonGoals = new()
                {
                    "Button/unbutton independently",
                    "Use utensils appropriately",
                    "Follow morning routine",
                    "Complete self-care tasks with minimal cues"
                },
                IsSystemTemplate = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Name = "Handwriting & Pre-Writing",
                Category = "handwriting",
                Description = "Develop pre-writing and writing skills",
                Activities = new()
                {
                    "Line tracing",
                    "Shape formation",
                    "Letter practice",
                    "Pencil control exercises",
                    "Proper posture practice",
                    "Visual-motor integration tasks",
                    "Copying activities"
                },
                CommonGoals = new()
                {
                    "Form letters legibly",
                    "Maintain proper pencil grasp",
                    "Write within lines",
                    "Copy text accurately"
                },
                IsSystemTemplate = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await _dbContext.Templates.InsertManyAsync(systemTemplates);
    }

    private TemplateResponse MapToResponse(Template template)
    {
        return new TemplateResponse(
            template.Id,
            template.Name,
            template.Category,
            template.Description,
            template.Activities,
            template.CommonGoals,
            template.UsageCount,
            template.IsSystemTemplate,
            template.CreatedAt
        );
    }
}

