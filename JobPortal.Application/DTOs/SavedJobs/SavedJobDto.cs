namespace JobPortal.Application.DTOs.SavedJobs;

public class SavedJobDto
{
    public string CandidateId { get; set; } = string.Empty;

    public string JobId { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    public string CompanyName { get; set; } = string.Empty;

    public DateTime SavedAt { get; set; }
}