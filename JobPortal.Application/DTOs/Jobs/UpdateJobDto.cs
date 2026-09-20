namespace JobPortal.Application.DTOs.Jobs;

public class UpdateJobDto
{
    public string CompanyId { get; set; } = string.Empty;

    public string CategoryId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? Requirements { get; set; }

    public string? Benefits { get; set; }

    public decimal? SalaryMin { get; set; }

    public decimal? SalaryMax { get; set; }

    public string Currency { get; set; } = "USD";

    public string EmploymentType { get; set; } = "FullTime";

    public string WorkMode { get; set; } = "OnSite";

    public string Location { get; set; } = string.Empty;

    public string? Responsibilities { get; set; }

    public string? PreferredQualifications { get; set; }

    public DateTime? ApplicationDeadline { get; set; }

    public List<UpdateJobSkillDto> Skills { get; set; } = new();

    public string Status { get; set; } = "Draft";
}

public class UpdateJobSkillDto
{
    public string SkillId { get; set; } = string.Empty;

    public bool IsRequired { get; set; }
}