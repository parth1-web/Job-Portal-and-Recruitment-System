namespace JobPortal.Application.DTOs.Resumes;

public class CreateResumeDto
{
    public string FileName { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;

    public bool IsDefault { get; set; }
}