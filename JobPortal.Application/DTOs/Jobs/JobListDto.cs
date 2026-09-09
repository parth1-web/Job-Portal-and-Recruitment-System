
using JobPortal.Domain.Enums;

namespace JobPortal.Application.DTOs.Jobs;

public class JobListDto
{
    public int Id { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public EmploymentType EmploymentType { get; set; }

    public WorkMode WorkMode { get; set; }

    public string? Location { get; set; }

    public DateTime ApplicationDeadline { get; set; }

    public JobStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
}
