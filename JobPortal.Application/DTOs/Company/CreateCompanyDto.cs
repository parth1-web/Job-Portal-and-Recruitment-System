namespace JobPortal.Application.DTOs.Company;

public class CreateCompanyDto
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? WebsiteUrl { get; set; }

    public string? Location { get; set; }

    public string? LogoUrl { get; set; }
}