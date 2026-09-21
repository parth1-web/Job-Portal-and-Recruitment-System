using JobPortal.Domain.Enums;

namespace JobPortal.Application.DTOs.Jobs;

public class JobListDto
{
    public string Id { get; set; } = string.Empty;

    public string CompanyId { get; set; } = string.Empty;

    public string CompanyName { get; set; } = string.Empty;

    public string CompanyLogoUrl { get; set; } = string.Empty;

    public string CategoryId { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public decimal? SalaryMin { get; set; }

    public decimal? SalaryMax { get; set; }

    public string Currency { get; set; } = "USD";

    public string EmploymentType { get; set; } = string.Empty;

    public string WorkMode { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public DateTime PostedDate { get; set; }

    public DateTime? ExpiryDate { get; set; }

    public int ApplicationsCount { get; set; }

    public int ViewsCount { get; set; }

    public bool IsSaved { get; set; }

    public List<string> Skills { get; set; } = new();

    public string Status { get; set; } = string.Empty;
}