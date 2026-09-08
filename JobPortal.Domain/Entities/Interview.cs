using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class Interview : BaseEntity
{
    public int ApplicationId { get; set; }

    public DateTime ScheduledAt { get; set; }

    public int DurationMinutes { get; set; }

    public string? MeetingLink { get; set; }

    public string? Notes { get; set; }

    public InterviewStatus Status { get; set; } = InterviewStatus.Scheduled;

    public JobApplication Application { get; set; } = null!;
}