using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class Candidate : BaseEntity
{
    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Location { get; set; }

    public string? ProfessionalTitle { get; set; }

    public string? Bio { get; set; }

    public string? ResumeUrl { get; set; }

    public User User { get; set; } = null!;

    public ICollection<SavedJob> SavedJobs { get; set; }
        = new List<SavedJob>();

    public ICollection<CandidateSkill> CandidateSkills { get; set; }
        = new List<CandidateSkill>();

    public ICollection<JobApplication> JobApplications { get; set; }
        = new List<JobApplication>();

    public ICollection<Resume> Resumes { get; set; }
        = new List<Resume>();
}