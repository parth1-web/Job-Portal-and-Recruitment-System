namespace JobPortal.Application.DTOs.Applications;

public class UpdateJobApplicationStatusDto
{
    public JobPortal.Domain.Enums.ApplicationStatus Status { get; set; }

    public string? Note { get; set; }
}