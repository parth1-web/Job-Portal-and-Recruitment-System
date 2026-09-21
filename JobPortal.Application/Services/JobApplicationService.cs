using JobPortal.Application.DTOs.Applications;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly IJobRepository _jobRepository;
    private readonly ICandidateRepository _candidateRepository;
    private readonly IResumeRepository _resumeRepository;
    private readonly IUserRepository _userRepository;

    public JobApplicationService(
        IJobApplicationRepository applicationRepository,
        IJobRepository jobRepository,
        ICandidateRepository candidateRepository,
        IResumeRepository resumeRepository,
        IUserRepository userRepository)
    {
        _applicationRepository = applicationRepository;
        _jobRepository = jobRepository;
        _candidateRepository = candidateRepository;
        _resumeRepository = resumeRepository;
        _userRepository = userRepository;
    }

    public async Task<JobApplicationDto> ApplyAsync(
        int userId,
        CreateJobApplicationDto dto,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        if (candidate is null)
        {
            throw new InvalidOperationException("Candidate profile not found.");
        }

        if (!int.TryParse(dto.JobId, out var jobIdInt))
        {
            throw new InvalidOperationException("Invalid job ID.");
        }

        var job = await _jobRepository.GetByIdAsync(jobIdInt, cancellationToken);
        if (job is null)
        {
            throw new InvalidOperationException("Job not found.");
        }

        if (job.Status != JobStatus.Published)
        {
            throw new InvalidOperationException("Can only apply to published jobs.");
        }

        if (job.ApplicationDeadline <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Application deadline has passed.");
        }

        var exists = await _applicationRepository.ExistsAsync(jobIdInt, candidate.Id, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("You have already applied to this job.");
        }

        if (!string.IsNullOrEmpty(dto.ResumeId) && int.TryParse(dto.ResumeId, out var resumeIdInt))
        {
            var resume = await _resumeRepository.GetByIdAsync(resumeIdInt, cancellationToken);
            if (resume is null || resume.CandidateId != candidate.Id)
            {
                throw new InvalidOperationException("Invalid resume selected.");
            }
        }

        var application = new JobApplication
        {
            JobId = jobIdInt,
            CandidateId = candidate.Id,
            ResumeId = int.TryParse(dto.ResumeId, out var resumeId) ? resumeId : null,
            CoverLetter = dto.CoverLetter?.Trim(),
            Status = ApplicationStatus.Applied,
            AppliedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _applicationRepository.AddAsync(application, cancellationToken);

        var created = await _applicationRepository.GetByIdWithDetailsAsync(application.Id, cancellationToken);
        if (created is null)
        {
            throw new InvalidOperationException("Application could not be retrieved after creation.");
        }

        return MapToDto(created);
    }

    public async Task<IReadOnlyList<JobApplicationListDto>> GetMyApplicationsAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        if (candidate is null)
        {
            return Array.Empty<JobApplicationListDto>();
        }

        var applications = await _applicationRepository.GetByCandidateIdAsync(candidate.Id, cancellationToken);
        return applications.Select(MapToListDto).ToList();
    }

    public async Task<JobApplicationDto?> GetApplicationByIdAsync(
        int userId,
        string applicationId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        if (candidate is null)
        {
            return null;
        }

        if (!int.TryParse(applicationId, out var appIdInt))
        {
            return null;
        }

        var application = await _applicationRepository.GetByIdWithDetailsAsync(appIdInt, cancellationToken);
        if (application is null || application.CandidateId != candidate.Id)
        {
            return null;
        }

        return MapToDto(application);
    }

    public async Task<IReadOnlyList<JobApplicationListDto>> GetApplicationsForJobAsync(
        int userId,
        string jobId,
        CancellationToken cancellationToken = default)
    {
        var employer = await _userRepository.GetByIdAsync(userId);
        if (employer is null)
        {
            return Array.Empty<JobApplicationListDto>();
        }

        if (!int.TryParse(jobId, out var jobIdInt))
        {
            return Array.Empty<JobApplicationListDto>();
        }

        var job = await _jobRepository.GetByIdAsync(jobIdInt, cancellationToken);
        if (job is null || job.Employer.UserId != userId)
        {
            return Array.Empty<JobApplicationListDto>();
        }

        var applications = await _applicationRepository.GetByJobIdAsync(jobIdInt, cancellationToken);
        return applications.Select(MapToListDto).ToList();
    }

    public async Task<JobApplicationDto?> UpdateStatusAsync(
        int userId,
        string applicationId,
        UpdateJobApplicationStatusDto dto,
        CancellationToken cancellationToken = default)
    {
        if (!int.TryParse(applicationId, out var appIdInt))
        {
            return null;
        }

        var application = await _applicationRepository.GetByIdWithDetailsAsync(appIdInt, cancellationToken);
        if (application is null)
        {
            return null;
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            return null;
        }

        var isEmployer = application.Job.Employer.UserId == userId;
        var isAdmin = user.Role.Name == "Admin";

        if (!isEmployer && !isAdmin)
        {
            throw new UnauthorizedAccessException("Not authorized to update this application.");
        }

        if (!Enum.TryParse<ApplicationStatus>(dto.Status, true, out var newStatus))
        {
            throw new ArgumentException("Invalid status value.");
        }

        var oldStatus = application.Status;
        application.Status = newStatus;
        application.UpdatedAt = DateTime.UtcNow;

        await _applicationRepository.UpdateAsync(application, cancellationToken);

        var history = new ApplicationStatusHistory
        {
            ApplicationId = application.Id,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangedByUserId = userId,
            ChangedAt = DateTime.UtcNow,
            Note = dto.Note?.Trim()
        };

        application.StatusHistory.Add(history);
        await _applicationRepository.UpdateAsync(application, cancellationToken);

        return MapToDto(application);
    }

    public async Task WithdrawAsync(
        int userId,
        string applicationId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        if (candidate is null)
        {
            throw new InvalidOperationException("Candidate profile not found.");
        }

        if (!int.TryParse(applicationId, out var appIdInt))
        {
            throw new InvalidOperationException("Invalid application ID.");
        }

        var application = await _applicationRepository.GetByIdAsync(appIdInt, cancellationToken);
        if (application is null || application.CandidateId != candidate.Id)
        {
            throw new InvalidOperationException("Application not found.");
        }

        if (application.Status != ApplicationStatus.Applied && application.Status != ApplicationStatus.UnderReview)
        {
            throw new InvalidOperationException("Can only withdraw applications that are Applied or Under Review.");
        }

        application.Status = ApplicationStatus.Withdrawn;
        application.UpdatedAt = DateTime.UtcNow;

        await _applicationRepository.UpdateAsync(application, cancellationToken);
    }

    private static JobApplicationDto MapToDto(JobApplication application)
    {
        return new JobApplicationDto
        {
            Id = application.Id.ToString(),
            JobId = application.JobId.ToString(),
            JobTitle = application.Job?.Title ?? string.Empty,
            CompanyName = application.Job?.Company?.Name ?? string.Empty,
            CompanyLogoUrl = application.Job?.Company?.LogoUrl ?? string.Empty,
            CandidateId = application.CandidateId.ToString(),
            CandidateName = application.Candidate is null
                ? string.Empty
                : $"{application.Candidate.FirstName} {application.Candidate.LastName}".Trim(),
            CandidateEmail = application.Candidate?.User?.Email ?? string.Empty,
            ResumeId = application.ResumeId.HasValue ? application.ResumeId.Value.ToString() : string.Empty,
            CoverLetter = application.CoverLetter,
            Status = application.Status.ToString(),
            AppliedAt = application.AppliedAt,
            ReviewedAt = application.UpdatedAt != application.CreatedAt ? application.UpdatedAt : null,
            Skills = application.Job?.JobSkills?.Select(js => js.Skill.Name).ToList() ?? new List<string>(),
            RejectionReason = string.Empty,
            CreatedAt = application.CreatedAt,
            UpdatedAt = application.UpdatedAt
        };
    }

    private static JobApplicationListDto MapToListDto(JobApplication application)
    {
        return new JobApplicationListDto
        {
            Id = application.Id.ToString(),
            JobId = application.JobId.ToString(),
            JobTitle = application.Job?.Title ?? string.Empty,
            CompanyName = application.Job?.Company?.Name ?? string.Empty,
            CandidateId = application.CandidateId.ToString(),
            CandidateName = application.Candidate is null
                ? string.Empty
                : $"{application.Candidate.FirstName} {application.Candidate.LastName}".Trim(),
            Status = application.Status.ToString(),
            AppliedAt = application.AppliedAt
        };
    }
}