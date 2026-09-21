namespace JobPortal.Application.DTOs.Applications;

public class CreateJobApplicationDto
{
    public string JobId { get; set; } = string.Empty;

    public string? ResumeId { get; set; }

    public string? CoverLetter { get; set; }
}