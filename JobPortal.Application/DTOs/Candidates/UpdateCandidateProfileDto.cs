namespace JobPortal.Application.DTOs.Candidates;

public class UpdateCandidateProfileDto
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Location { get; set; }

    public string? ProfessionalTitle { get; set; }

    public string? Bio { get; set; }

    public string? ResumeUrl { get; set; }
}