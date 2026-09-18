namespace JobPortal.Application.DTOs.Applications;

public class CreateJobApplicationDto
{
    public int JobId { get; set; }

    public int ResumeId { get; set; }

    public string? CoverLetter { get; set; }
}