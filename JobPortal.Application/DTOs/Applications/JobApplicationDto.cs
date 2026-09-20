namespace JobPortal.Application.DTOs.Applications;

public class JobApplicationDto
{
    public string Id { get; set; } = string.Empty;

    public string JobId { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    public string CompanyName { get; set; } = string.Empty;

    public string CompanyLogoUrl { get; set; } = string.Empty;

    public string CandidateId { get; set; } = string.Empty;

    public string CandidateName { get; set; } = string.Empty;

    public string CandidateEmail { get; set; } = string.Empty;

    public string? ResumeId { get; set; }

    public string? CoverLetter { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime AppliedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public List<string> Skills { get; set; } = new();

    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}