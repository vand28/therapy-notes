using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TherapyNotes.Core.Models;

namespace TherapyNotes.Infrastructure.Reports;

public class ReportService
{
    public ReportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateProgressReport(Client client, List<Session> sessions, DateTime startDate, DateTime endDate)
    {
        var filteredSessions = sessions
            .Where(s => s.SessionDate >= startDate && s.SessionDate <= endDate)
            .OrderBy(s => s.SessionDate)
            .ToList();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontColor(Colors.Black));

                page.Header().Element(ComposeHeader);
                page.Content().Element(content => ComposeContent(content, client, filteredSessions, startDate, endDate));
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        }).GeneratePdf();
    }

    void ComposeHeader(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("TherapyNotes").FontSize(20).Bold().FontColor(Colors.Blue.Medium);
                column.Item().Text("Progress Report").FontSize(14);
            });

            row.ConstantItem(100).AlignRight().Text($"{DateTime.Now:MMM d, yyyy}").FontSize(10);
        });
    }

    void ComposeContent(IContainer container, Client client, List<Session> sessions, DateTime startDate, DateTime endDate)
    {
        container.PaddingVertical(20).Column(column =>
        {
            column.Spacing(10);

            // Client Info Section
            column.Item().Element(c => ComposeClientInfo(c, client));

            // Goals Section
            column.Item().PaddingTop(20).Element(c => ComposeGoals(c, client));

            // Sessions Summary
            column.Item().PaddingTop(20).Element(c => ComposeSessionsSummary(c, sessions, startDate, endDate));

            // Recent Sessions
            column.Item().PaddingTop(20).Element(c => ComposeRecentSessions(c, sessions));
        });
    }

    void ComposeClientInfo(IContainer container, Client client)
    {
        container.Column(column =>
        {
            column.Item().Text("Client Information").FontSize(16).Bold();
            column.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
            column.Item().PaddingTop(10).Row(row =>
            {
                row.RelativeItem().Text($"Name: {client.Name}").FontSize(12);
                if (client.DateOfBirth != null)
                {
                    row.RelativeItem().Text($"DOB: {client.DateOfBirth.Value:MMM d, yyyy}").FontSize(12);
                }
            });
            if (client.Diagnosis.Count > 0)
            {
                column.Item().PaddingTop(5).Text($"Diagnosis: {string.Join(", ", client.Diagnosis)}").FontSize(12);
            }
        });
    }

    void ComposeGoals(IContainer container, Client client)
    {
        container.Column(column =>
        {
            column.Item().Text("Current Goals").FontSize(16).Bold();
            column.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
            
            foreach (var goal in client.Goals)
            {
                column.Item().PaddingTop(10).Column(goalColumn =>
                {
                    goalColumn.Item().Text(goal.Description).FontSize(12).Bold();
                    goalColumn.Item().PaddingTop(3).Row(row =>
                    {
                        row.RelativeItem().Text($"Progress: {goal.CurrentLevel}%").FontSize(11);
                        if (goal.TargetDate != null)
                        {
                            row.RelativeItem().Text($"Target: {goal.TargetDate.Value:MMM d, yyyy}").FontSize(11);
                        }
                    });
                    
                    // Progress bar
                    goalColumn.Item().PaddingTop(5).Height(10).Background(Colors.Grey.Lighten3).Row(progressRow =>
                    {
                        progressRow.RelativeItem(goal.CurrentLevel).Background(Colors.Blue.Medium);
                        progressRow.RelativeItem(100 - goal.CurrentLevel);
                    });
                });
            }
        });
    }

    void ComposeSessionsSummary(IContainer container, List<Session> sessions, DateTime startDate, DateTime endDate)
    {
        container.Column(column =>
        {
            column.Item().Text($"Sessions Summary ({startDate:MMM d} - {endDate:MMM d, yyyy})").FontSize(16).Bold();
            column.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
            column.Item().PaddingTop(10).Row(row =>
            {
                row.RelativeItem().Text($"Total Sessions: {sessions.Count}").FontSize(12);
                row.RelativeItem().Text($"Total Minutes: {sessions.Sum(s => s.DurationMinutes)}").FontSize(12);
            });
        });
    }

    void ComposeRecentSessions(IContainer container, List<Session> sessions)
    {
        container.Column(column =>
        {
            column.Item().Text("Recent Sessions").FontSize(16).Bold();
            column.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

            foreach (var session in sessions.Take(10))
            {
                column.Item().PaddingTop(10).Column(sessionColumn =>
                {
                    sessionColumn.Item().Row(row =>
                    {
                        row.RelativeItem().Text($"{session.SessionDate:MMM d, yyyy}").FontSize(12).Bold();
                        row.ConstantItem(80).AlignRight().Text($"{session.DurationMinutes} min").FontSize(11);
                    });
                    
                    if (!string.IsNullOrEmpty(session.Template))
                    {
                        sessionColumn.Item().PaddingTop(3).Text($"Template: {session.Template}").FontSize(11);
                    }
                    
                    if (session.ActivitiesDone.Count > 0)
                    {
                        sessionColumn.Item().PaddingTop(3).Text($"Activities: {string.Join(", ", session.ActivitiesDone.Take(5))}").FontSize(10);
                    }
                    
                    if (!string.IsNullOrEmpty(session.Observations))
                    {
                        sessionColumn.Item().PaddingTop(3).Text(session.Observations.Length > 200 
                            ? session.Observations.Substring(0, 200) + "..." 
                            : session.Observations).FontSize(10);
                    }
                });
            }
        });
    }
}

