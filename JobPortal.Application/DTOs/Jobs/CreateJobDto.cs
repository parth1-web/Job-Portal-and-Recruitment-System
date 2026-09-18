using JobPortal.Domain.Enums;

namespace JobPortal.Application.DTOs.Jobs;

public class CreateJobDto
{
    public int CompanyId { get; set; }

    public int CategoryId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? Requirements { get; set; }

    public decimal? SalaryMin { get; set; }

    public decimal? SalaryMax { get; set; }

    public EmploymentType EmploymentType { get; set; }

    public WorkMode WorkMode { get; set; }

    public string? Location { get; set; }

    public DateTime ApplicationDeadline { get; set; }

    public List<CreateJobSkillDto> Skills { get; set; } = new();
}

public class CreateJobSkillDto
{
    public int SkillId { get; set; }

    public bool IsRequired { get; set; }
}