using JobPortal.Application.DTOs.SavedJobs;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Services;

public class SavedJobService : ISavedJobService
{
    private readonly ISavedJobRepository _savedJobRepository;
    private readonly IJobRepository _jobRepository;
    private readonly ICandidateRepository _candidateRepository;

    public SavedJobService(
        ISavedJobRepository savedJobRepository,
        IJobRepository jobRepository,
        ICandidateRepository candidateRepository)
    {
        _savedJobRepository = savedJobRepository;
        _jobRepository = jobRepository;
        _candidateRepository = candidateRepository;
    }

    public async Task<IReadOnlyList<SavedJobDto>> GetSavedJobsAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        if (candidate is null)
        {
            return Array.Empty<SavedJobDto>();
        }

        var savedJobs = await _savedJobRepository.GetByCandidateIdAsync(candidate.Id, cancellationToken);
        return savedJobs.Select(sj => MapToDto(sj, sj.Job.Title, sj.Job.Company.Name)).ToList();
    }

    public async Task<SavedJobDto> SaveJobAsync(
        int userId,
        string jobId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        if (candidate is null)
        {
            throw new InvalidOperationException("Candidate profile not found.");
        }

        if (!int.TryParse(jobId, out var jobIdInt))
        {
            throw new InvalidOperationException("Invalid job ID.");
        }

        var job = await _jobRepository.GetByIdAsync(jobIdInt, cancellationToken);
        if (job is null)
        {
            throw new InvalidOperationException("Job not found.");
        }

        var existing = await _savedJobRepository.GetAsync(candidate.Id, jobIdInt, cancellationToken);
        if (existing is not null)
        {
            throw new InvalidOperationException("Job is already saved.");
        }

        var savedJob = new SavedJob
        {
            CandidateId = candidate.Id,
            JobId = jobIdInt,
            SavedAt = DateTime.UtcNow
        };

        await _savedJobRepository.AddAsync(savedJob, cancellationToken);

        return MapToDto(savedJob, job.Title, job.Company.Name);
    }

    public async Task<bool> UnsaveJobAsync(
        int userId,
        string jobId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        if (candidate is null)
        {
            return false;
        }

        if (!int.TryParse(jobId, out var jobIdInt))
        {
            return false;
        }

        var savedJob = await _savedJobRepository.GetAsync(candidate.Id, jobIdInt, cancellationToken);
        if (savedJob is null)
        {
            return false;
        }

        await _savedJobRepository.DeleteAsync(savedJob, cancellationToken);
        return true;
    }

    public async Task<bool> IsJobSavedAsync(
        int userId,
        string jobId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        if (candidate is null)
        {
            return false;
        }

        if (!int.TryParse(jobId, out var jobIdInt))
        {
            return false;
        }

        var savedJob = await _savedJobRepository.GetAsync(candidate.Id, jobIdInt, cancellationToken);
        return savedJob is not null;
    }

    private static SavedJobDto MapToDto(SavedJob savedJob, string jobTitle, string companyName)
    {
        return new SavedJobDto
        {
            CandidateId = savedJob.CandidateId.ToString(),
            JobId = savedJob.JobId.ToString(),
            JobTitle = jobTitle,
            CompanyName = companyName,
            SavedAt = savedJob.SavedAt
        };
    }
}