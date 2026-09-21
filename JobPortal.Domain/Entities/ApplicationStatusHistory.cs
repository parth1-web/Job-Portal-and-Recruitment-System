using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class ApplicationStatusHistory
{
    public int Id { get; set; }

    public int ApplicationId { get; set; }

    public ApplicationStatus OldStatus { get; set; }

    public ApplicationStatus NewStatus { get; set; }

    public int ChangedByUserId { get; set; }

    public DateTime ChangedAt { get; set; }

    public string? Note { get; set; }

    public JobApplication Application { get; set; } = null!;

    public User ChangedByUser { get; set; } = null!;
}