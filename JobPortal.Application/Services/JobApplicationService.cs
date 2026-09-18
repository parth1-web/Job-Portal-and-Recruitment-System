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

        var job = await _jobRepository.GetByIdAsync(dto.JobId, cancellationToken);
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

        var exists = await _applicationRepository.ExistsAsync(dto.JobId, candidate.Id, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("You have already applied to this job.");
        }

        var resume = await _resumeRepository.GetByIdAsync(dto.ResumeId, cancellationToken);
        if (resume is null || resume.CandidateId != candidate.Id)
        {
            throw new InvalidOperationException("Invalid resume selected.");
        }

        var application = new JobApplication
        {
            JobId = dto.JobId,
            CandidateId = candidate.Id,
            ResumeId = dto.ResumeId,
            CoverLetter = dto.CoverLetter?.Trim(),
            Status = ApplicationStatus.Applied,
            AppliedAt = DateTime.UtcNow
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
        int applicationId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        if (candidate is null)
        {
            return null;
        }

        var application = await _applicationRepository.GetByIdWithDetailsAsync(applicationId, cancellationToken);
        if (application is null || application.CandidateId != candidate.Id)
        {
            return null;
        }

        return MapToDto(application);
    }

    public async Task<IReadOnlyList<JobApplicationListDto>> GetApplicationsForJobAsync(
        int userId,
        int jobId,
        CancellationToken cancellationToken = default)
    {
        var employer = await _userRepository.GetByIdAsync(userId);
        if (employer is null)
        {
            return Array.Empty<JobApplicationListDto>();
        }

        var job = await _jobRepository.GetByIdAsync(jobId, cancellationToken);
        if (job is null || job.Employer.UserId != userId)
        {
            return Array.Empty<JobApplicationListDto>();
        }

        var applications = await _applicationRepository.GetByJobIdAsync(jobId, cancellationToken);
        return applications.Select(MapToListDto).ToList();
    }

    public async Task<JobApplicationDto?> UpdateStatusAsync(
        int userId,
        int applicationId,
        UpdateJobApplicationStatusDto dto,
        CancellationToken cancellationToken = default)
    {
        var application = await _applicationRepository.GetByIdWithDetailsAsync(applicationId, cancellationToken);
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

        var oldStatus = application.Status;
        application.Status = dto.Status;
        application.UpdatedAt = DateTime.UtcNow;

        await _applicationRepository.UpdateAsync(application, cancellationToken);

        var history = new ApplicationStatusHistory
        {
            ApplicationId = application.Id,
            OldStatus = oldStatus,
            NewStatus = dto.Status,
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
        int applicationId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        if (candidate is null)
        {
            throw new InvalidOperationException("Candidate profile not found.");
        }

        var application = await _applicationRepository.GetByIdAsync(applicationId, cancellationToken);
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
            Id = application.Id,
            JobId = application.JobId,
            JobTitle = application.Job.Title,
            CompanyName = application.Job.Company.Name,
            CandidateId = application.CandidateId,
            CandidateName = $"{application.Candidate.FirstName} {application.Candidate.LastName}",
            ResumeId = application.ResumeId,
            CoverLetter = application.CoverLetter,
            Status = application.Status,
            AppliedAt = application.AppliedAt,
            CreatedAt = application.CreatedAt,
            UpdatedAt = application.UpdatedAt
        };
    }

    private static JobApplicationListDto MapToListDto(JobApplication application)
    {
        return new JobApplicationListDto
        {
            Id = application.Id,
            JobId = application.JobId,
            JobTitle = application.Job.Title,
            CompanyName = application.Job.Company.Name,
            CandidateId = application.CandidateId,
            CandidateName = $"{application.Candidate.FirstName} {application.Candidate.LastName}",
            Status = application.Status,
            AppliedAt = application.AppliedAt
        };
    }
}