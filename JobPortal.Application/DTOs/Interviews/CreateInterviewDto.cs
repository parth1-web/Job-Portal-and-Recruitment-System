namespace JobPortal.Application.DTOs.Interviews;

public class CreateInterviewDto
{
    public int ApplicationId { get; set; }

    public DateTime ScheduledAt { get; set; }

    public int DurationMinutes { get; set; }

    public string? MeetingLink { get; set; }

    public string? Notes { get; set; }
}