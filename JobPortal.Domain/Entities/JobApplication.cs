using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class JobApplication : BaseEntity
{
    public int JobId { get; set; }

    public int CandidateId { get; set; }

    public int ResumeId { get; set; }

    public string? CoverLetter { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;

    public DateTime AppliedAt { get; set; }

    public Job Job { get; set; } = null!;

    public Candidate Candidate { get; set; } = null!;

    public Resume Resume { get; set; } = null!;

    public ICollection<Interview> Interviews { get; set; }
        = new List<Interview>();

    public ICollection<ApplicationStatusHistory> StatusHistory { get; set; }
        = new List<ApplicationStatusHistory>();
}