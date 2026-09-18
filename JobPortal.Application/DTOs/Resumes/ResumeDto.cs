namespace JobPortal.Application.DTOs.Resumes;

public class ResumeDto
{
    public int Id { get; set; }

    public int CandidateId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;

    public bool IsDefault { get; set; }

    public DateTime UploadedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}