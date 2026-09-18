using JobPortal.Domain.Enums;

namespace JobPortal.Application.DTOs.Interviews;

public class InterviewDto
{
    public int Id { get; set; }

    public int ApplicationId { get; set; }

    public string JobTitle { get; set; } = string.Empty;

    public string CandidateName { get; set; } = string.Empty;

    public DateTime ScheduledAt { get; set; }

    public int DurationMinutes { get; set; }

    public string? MeetingLink { get; set; }

    public string? Notes { get; set; }

    public InterviewStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}