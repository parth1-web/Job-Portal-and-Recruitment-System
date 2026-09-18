namespace JobPortal.Application.DTOs.SavedJobs;

public class SavedJobDto
{
    public int CandidateId { get; set; }

    public int JobId { get; set; }

    public string JobTitle { get; set; } = string.Empty;

    public string CompanyName { get; set; } = string.Empty;

    public DateTime SavedAt { get; set; }
}