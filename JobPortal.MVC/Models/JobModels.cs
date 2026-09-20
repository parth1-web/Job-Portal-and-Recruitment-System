using System.ComponentModel.DataAnnotations;

namespace JobPortal.MVC.Models
{
    public class JobListDto
    {
        public string Id { get; set; } = "";
        public string Title { get; set; } = "";
        public string CompanyId { get; set; } = "";
        public string CompanyName { get; set; } = "";
        public string CompanyLogoUrl { get; set; } = "";
        public string CategoryId { get; set; } = "";
        public string Location { get; set; } = "";
        public string WorkMode { get; set; } = "";
        public string EmploymentType { get; set; } = "";
        public decimal? MinSalary { get; set; }
        public decimal? MaxSalary { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime PostedDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int ApplicationsCount { get; set; }
        public int ViewsCount { get; set; }
        public bool IsSaved { get; set; }
        public List<string> Skills { get; set; } = new();
        public string Status { get; set; } = "";
    }

    public class JobDetailDto : JobListDto
    {
        public string Description { get; set; } = "";
        public string Requirements { get; set; } = "";
        public string Benefits { get; set; } = "";
        public string CompanyDescription { get; set; } = "";
        public string CompanyWebsite { get; set; } = "";
        public string CompanySize { get; set; } = "";
        public string CompanyIndustry { get; set; } = "";
        public List<string> Responsibilities { get; set; } = new();
        public List<string> PreferredQualifications { get; set; } = new();
        public string? ApplicationDeadline { get; set; }
        public string? ContactEmail { get; set; }
        public bool HasApplied { get; set; }
        public string? ApplicationStatus { get; set; }
        public DateTime? AppliedAt { get; set; }
    }

    public class CreateJobRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 5)]
        public string Title { get; set; } = "";

        [Required]
        [StringLength(5000, MinimumLength = 50)]
        public string Description { get; set; } = "";

        [Required]
        [StringLength(3000, MinimumLength = 20)]
        public string Requirements { get; set; } = "";

        [StringLength(2000)]
        public string Benefits { get; set; } = "";

        [Required]
        public string Location { get; set; } = "";

        [Required]
        public string WorkMode { get; set; } = "OnSite";

        [Required]
        public string EmploymentType { get; set; } = "FullTime";

        public decimal? MinSalary { get; set; }
        public decimal? MaxSalary { get; set; }
        public string Currency { get; set; } = "USD";

        [StringLength(1000)]
        public string Responsibilities { get; set; } = "";

        [StringLength(1000)]
        public string PreferredQualifications { get; set; } = "";

        public DateTime? ExpiryDate { get; set; }
        public List<string> SkillIds { get; set; } = new();
        public string? CompanyId { get; set; }
        public string? CategoryId { get; set; }
        public string Status { get; set; } = "Draft";
    }

    public class UpdateJobRequest : CreateJobRequest
    {
        public string Status { get; set; } = "Draft";
    }

    public class JobFilterRequest
    {
        public string? SearchTerm { get; set; }
        public string? Location { get; set; }
        public string? WorkMode { get; set; }
        public string? EmploymentType { get; set; }
        public decimal? MinSalary { get; set; }
        public decimal? MaxSalary { get; set; }
        public List<string> SkillIds { get; set; } = new();
        public string? CompanyId { get; set; }
        public string? Status { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "PostedDate";
        public string SortDirection { get; set; } = "desc";
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => Page > 1;
        public bool HasNextPage => Page < TotalPages;
    }

    public class JobApplicationDto
    {
        public string Id { get; set; } = "";
        public string JobId { get; set; } = "";
        public string JobTitle { get; set; } = "";
        public string CompanyName { get; set; } = "";
        public string CompanyLogoUrl { get; set; } = "";
        public string CandidateId { get; set; } = "";
        public string CandidateName { get; set; } = "";
        public string CandidateEmail { get; set; } = "";
        public string Status { get; set; } = "";
        public DateTime AppliedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? CoverLetter { get; set; }
        public string? ResumeUrl { get; set; }
        public List<string> Skills { get; set; } = new();
        public string? RejectionReason { get; set; }
    }

    public class CreateApplicationRequest
    {
        [Required]
        public string JobId { get; set; } = "";

        [StringLength(2000)]
        public string CoverLetter { get; set; } = "";

        public string? ResumeId { get; set; }
    }

    public class UpdateApplicationStatusRequest
    {
        [Required]
        public string Status { get; set; } = "";

        public string? Notes { get; set; }
        public string? RejectionReason { get; set; }
    }
}