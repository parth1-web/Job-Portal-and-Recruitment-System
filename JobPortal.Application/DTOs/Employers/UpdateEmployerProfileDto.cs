namespace JobPortal.Application.DTOs.Employers;

public class UpdateEmployerProfileDto
{
    public string CompanyName { get; set; } = string.Empty;

    public string? CompanyDescription { get; set; }

    public string? Website { get; set; }

    public string? Industry { get; set; }

    public string? Location { get; set; }

    public string? CompanyLogoUrl { get; set; }
}