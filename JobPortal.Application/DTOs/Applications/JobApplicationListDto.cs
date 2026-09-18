using JobPortal.Domain.Enums;

namespace JobPortal.Application.DTOs.Applications;

public class JobApplicationListDto
{
    public int Id { get; set; }

    public int JobId { get; set; }

    public string JobTitle { get; set; } = string.Empty;

    public string CompanyName { get; set; } = string.Empty;

    public int CandidateId { get; set; }

    public string CandidateName { get; set; } = string.Empty;

    public ApplicationStatus Status { get; set; }

    public DateTime AppliedAt { get; set; }
}