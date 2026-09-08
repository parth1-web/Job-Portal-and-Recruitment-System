using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class Resume : BaseEntity
{
    public int CandidateId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;

    public bool IsDefault { get; set; }

    public DateTime UploadedAt { get; set; }

    public Candidate Candidate { get; set; } = null!;

    public ICollection<JobApplication> JobApplications { get; set; }
        = new List<JobApplication>();
}