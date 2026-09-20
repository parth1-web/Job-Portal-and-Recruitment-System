namespace JobPortal.MVC.Models
{
    public class SkillDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Category { get; set; } = "";
        public int DemandCount { get; set; }
    }

    public class CompanyDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string LogoUrl { get; set; } = "";
        public string Description { get; set; } = "";
        public string Website { get; set; } = "";
        public string Size { get; set; } = "";
        public string Industry { get; set; } = "";
        public string Location { get; set; } = "";
        public int EmployeesCount { get; set; }
        public int JobsCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CandidateProfileDto
    {
        public string Id { get; set; } = "";
        public string UserId { get; set; } = "";
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string Headline { get; set; } = "";
        public string Summary { get; set; } = "";
        public string Location { get; set; } = "";
        public string ProfileImageUrl { get; set; } = "";
        public string ResumeUrl { get; set; } = "";
        public List<SkillDto> Skills { get; set; } = new();
        public List<EducationDto> Education { get; set; } = new();
        public List<ExperienceDto> Experience { get; set; } = new();
        public List<CertificationDto> Certifications { get; set; } = new();
        public List<LanguageDto> Languages { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int ProfileCompletionPercentage { get; set; }
    }

    public class EducationDto
    {
        public string Id { get; set; } = "";
        public string Institution { get; set; } = "";
        public string Degree { get; set; } = "";
        public string FieldOfStudy { get; set; } = "";
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Grade { get; set; }
        public string? Description { get; set; }
    }

    public class ExperienceDto
    {
        public string Id { get; set; } = "";
        public string Company { get; set; } = "";
        public string Position { get; set; } = "";
        public string Location { get; set; } = "";
        public string Description { get; set; } = "";
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public List<string> Skills { get; set; } = new();
    }

    public class CertificationDto
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Issuer { get; set; } = "";
        public DateTime IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? CredentialId { get; set; }
        public string? CredentialUrl { get; set; }
    }

    public class LanguageDto
    {
        public string Id { get; set; } = "";
        public string Language { get; set; } = "";
        public string Proficiency { get; set; } = "";
    }

    public class EmployerProfileDto
    {
        public string Id { get; set; } = "";
        public string UserId { get; set; } = "";
        public string CompanyName { get; set; } = "";
        public string CompanyLogoUrl { get; set; } = "";
        public string Website { get; set; } = "";
        public string Description { get; set; } = "";
        public string Size { get; set; } = "";
        public string Industry { get; set; } = "";
        public string Location { get; set; } = "";
        public string ContactEmail { get; set; } = "";
        public string ContactPhone { get; set; } = "";
        public List<string> SocialLinks { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public int JobsPosted { get; set; }
        public int ActiveJobs { get; set; }
    }

    public class NotificationDto
    {
        public string Id { get; set; } = "";
        public string Title { get; set; } = "";
        public string Message { get; set; } = "";
        public string Type { get; set; } = "";
        public bool IsRead { get; set; }
        public string? ActionUrl { get; set; }
        public string? ReferenceId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalJobs { get; set; }
        public int ActiveJobs { get; set; }
        public int TotalApplications { get; set; }
        public int PendingApplications { get; set; }
        public int SavedJobs { get; set; }
        public int ProfileViews { get; set; }
        public int InterviewsScheduled { get; set; }
        public decimal AverageResponseTime { get; set; }
        public List<ChartDataPoint> ApplicationsChart { get; set; } = new();
        public List<ChartDataPoint> ViewsChart { get; set; } = new();
    }

    public class ChartDataPoint
    {
        public string Label { get; set; } = "";
        public int Value { get; set; }
        public string? Color { get; set; }
    }

    public class InterviewDto
    {
        public string Id { get; set; } = "";
        public string ApplicationId { get; set; } = "";
        public string JobTitle { get; set; } = "";
        public string CompanyName { get; set; } = "";
        public string CandidateName { get; set; } = "";
        public DateTime ScheduledAt { get; set; }
        public int DurationMinutes { get; set; }
        public string Type { get; set; } = "";
        public string Status { get; set; } = "";
        public string? MeetingLink { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
        public List<string> Interviewers { get; set; } = new();
    }

    public class CreateInterviewRequest
    {
        public string ApplicationId { get; set; } = "";
        public DateTime ScheduledAt { get; set; }
        public int DurationMinutes { get; set; } = 60;
        public string Type { get; set; } = "Video";
        public string? MeetingLink { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
        public List<string> InterviewerIds { get; set; } = new();
    }

    public class UpdateInterviewRequest
    {
        public DateTime? ScheduledAt { get; set; }
        public int? DurationMinutes { get; set; }
        public string? Type { get; set; }
        public string? Status { get; set; }
        public string? MeetingLink { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
        public List<string>? InterviewerIds { get; set; }
    }

    public class ResumeDto
    {
        public string Id { get; set; } = "";
        public string FileName { get; set; } = "";
        public string FileUrl { get; set; } = "";
        public long FileSize { get; set; }
        public string ContentType { get; set; } = "";
        public bool IsDefault { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class CreateResumeRequest
    {
        public string FileName { get; set; } = "";
        public string FileUrl { get; set; } = "";
        public bool IsDefault { get; set; }
    }
}