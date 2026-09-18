namespace JobPortal.Application.DTOs.Interviews;

public class UpdateInterviewDto
{
    public DateTime? ScheduledAt { get; set; }

    public int? DurationMinutes { get; set; }

    public string? MeetingLink { get; set; }

    public string? Notes { get; set; }

    public JobPortal.Domain.Enums.InterviewStatus? Status { get; set; }
}