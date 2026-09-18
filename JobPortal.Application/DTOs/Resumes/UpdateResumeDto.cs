namespace JobPortal.Application.DTOs.Resumes;

public class UpdateResumeDto
{
    public string? FileName { get; set; }

    public string? FileUrl { get; set; }

    public bool? IsDefault { get; set; }
}