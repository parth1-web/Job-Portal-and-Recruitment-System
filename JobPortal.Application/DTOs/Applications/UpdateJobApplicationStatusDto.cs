namespace JobPortal.Application.DTOs.Applications;

public class UpdateJobApplicationStatusDto
{
    public string Status { get; set; } = string.Empty;

    public string? Note { get; set; }
}