namespace JobPortal.Application.DTOs.Applications;

public class JobApplicationListDto
{
    public string Id { get; set; } = string.Empty;

    public string JobId { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    public string CompanyName { get; set; } = string.Empty;

    public string CandidateId { get; set; } = string.Empty;

    public string CandidateName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime AppliedAt { get; set; }
}