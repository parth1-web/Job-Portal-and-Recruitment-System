using JobPortal.Domain.Common;
using JobPortal.Domain.Enums;

namespace JobPortal.Domain.Entities;

public class Job : BaseEntity
{
    public int EmployerId { get; set; }

    public int? CompanyId { get; set; }

    public int? CategoryId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? Requirements { get; set; }

    public decimal? SalaryMin { get; set; }

    public decimal? SalaryMax { get; set; }

    public EmploymentType EmploymentType { get; set; }

    public WorkMode WorkMode { get; set; }

    public string? Location { get; set; }

    public DateTime ApplicationDeadline { get; set; }

    public JobStatus Status { get; set; } = JobStatus.Draft;

    public Employer Employer { get; set; } = null!;

    public Company Company { get; set; } = null!;

    public JobCategory Category { get; set; } = null!;

    public ICollection<JobSkill> JobSkills { get; set; }
        = new List<JobSkill>();

    public ICollection<JobApplication> JobApplications { get; set; }
        = new List<JobApplication>();

    public ICollection<SavedJob> SavedJobs { get; set; }
        = new List<SavedJob>();
}