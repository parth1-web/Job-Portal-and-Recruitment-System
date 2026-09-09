
using JobPortal.Application.DTOs.Jobs;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Services;

public class JobService : IJobService
{
    private readonly IJobRepository _jobRepository;

    public JobService(IJobRepository jobRepository)
    {
        _jobRepository = jobRepository;
    }

    // =========================================================
    // CREATE JOB
    // =========================================================

    public async Task<JobDto> CreateAsync(
        int employerId,
        CreateJobDto request,
        CancellationToken cancellationToken = default)
    {
        ValidateJobData(
            request.Title,
            request.Description,
            request.SalaryMin,
            request.SalaryMax,
            request.ApplicationDeadline);

        var job = new Job
        {
            EmployerId = employerId,

            CompanyId = request.CompanyId,

            CategoryId = request.CategoryId,

            Title = request.Title.Trim(),

            Description = request.Description.Trim(),

            Requirements = string.IsNullOrWhiteSpace(request.Requirements)
                ? null
                : request.Requirements.Trim(),

            SalaryMin = request.SalaryMin,

            SalaryMax = request.SalaryMax,

            EmploymentType = request.EmploymentType,

            WorkMode = request.WorkMode,

            Location = string.IsNullOrWhiteSpace(request.Location)
                ? null
                : request.Location.Trim(),

            ApplicationDeadline = request.ApplicationDeadline,

            Status = JobStatus.Draft,

            CreatedAt = DateTime.UtcNow,

            UpdatedAt = DateTime.UtcNow
        };

        await _jobRepository.AddAsync(
            job,
            cancellationToken);

        // Reload the entity with Employer, Company and Category
        // navigation properties populated.
        var createdJob = await _jobRepository.GetByIdForEmployerAsync(
            job.Id,
            employerId,
            cancellationToken);

        if (createdJob is null)
        {
            throw new InvalidOperationException(
                "The job was created but could not be retrieved.");
        }

        return MapToDto(createdJob);
    }

    // =========================================================
    // GET EMPLOYER JOBS
    // =========================================================

    public async Task<IReadOnlyList<JobListDto>> GetByEmployerIdAsync(
        int employerId,
        CancellationToken cancellationToken = default)
    {
        var jobs = await _jobRepository.GetByEmployerIdAsync(
            employerId,
            cancellationToken);

        return jobs
            .Select(MapToListDto)
            .ToList();
    }

    // =========================================================
    // GET SINGLE JOB
    // =========================================================

    public async Task<JobDto?> GetByIdForEmployerAsync(
        int jobId,
        int employerId,
        CancellationToken cancellationToken = default)
    {
        var job = await _jobRepository.GetByIdForEmployerAsync(
            jobId,
            employerId,
            cancellationToken);

        if (job is null)
        {
            return null;
        }

        return MapToDto(job);
    }

    // =========================================================
    // UPDATE JOB
    // =========================================================

    public async Task<JobDto> UpdateAsync(
        int jobId,
        int employerId,
        UpdateJobDto request,
        CancellationToken cancellationToken = default)
    {
        ValidateJobData(
            request.Title,
            request.Description,
            request.SalaryMin,
            request.SalaryMax,
            request.ApplicationDeadline);

        var job = await _jobRepository.GetByIdForEmployerAsync(
            jobId,
            employerId,
            cancellationToken);

        if (job is null)
        {
            throw new KeyNotFoundException(
                "Job not found or you do not have permission to manage this job.");
        }

        if (job.Status != JobStatus.Draft)
        {
            throw new InvalidOperationException(
                "Only draft jobs can be updated.");
        }

        job.CompanyId = request.CompanyId;

        job.CategoryId = request.CategoryId;

        job.Title = request.Title.Trim();

        job.Description = request.Description.Trim();

        job.Requirements = string.IsNullOrWhiteSpace(request.Requirements)
            ? null
            : request.Requirements.Trim();

        job.SalaryMin = request.SalaryMin;

        job.SalaryMax = request.SalaryMax;

        job.EmploymentType = request.EmploymentType;

        job.WorkMode = request.WorkMode;

        job.Location = string.IsNullOrWhiteSpace(request.Location)
            ? null
            : request.Location.Trim();

        job.ApplicationDeadline = request.ApplicationDeadline;

        job.UpdatedAt = DateTime.UtcNow;

        await _jobRepository.UpdateAsync(
            job,
            cancellationToken);

        return MapToDto(job);
    }

    // =========================================================
    // PUBLISH JOB
    // =========================================================

    public async Task<JobDto> PublishAsync(
        int jobId,
        int employerId,
        CancellationToken cancellationToken = default)
    {
        var job = await _jobRepository.GetByIdForEmployerAsync(
            jobId,
            employerId,
            cancellationToken);

        if (job is null)
        {
            throw new KeyNotFoundException(
                "Job not found or you do not have permission to manage this job.");
        }

        if (job.Status != JobStatus.Draft)
        {
            throw new InvalidOperationException(
                "Only draft jobs can be published.");
        }

        if (job.ApplicationDeadline <= DateTime.UtcNow)
        {
            throw new InvalidOperationException(
                "A job with an expired application deadline cannot be published.");
        }

        job.Status = JobStatus.Published;

        job.UpdatedAt = DateTime.UtcNow;

        await _jobRepository.UpdateAsync(
            job,
            cancellationToken);

        return MapToDto(job);
    }

    // =========================================================
    // CLOSE JOB
    // =========================================================

    public async Task<JobDto> CloseAsync(
        int jobId,
        int employerId,
        CancellationToken cancellationToken = default)
    {
        var job = await _jobRepository.GetByIdForEmployerAsync(
            jobId,
            employerId,
            cancellationToken);

        if (job is null)
        {
            throw new KeyNotFoundException(
                "Job not found or you do not have permission to manage this job.");
        }

        if (job.Status != JobStatus.Published)
        {
            throw new InvalidOperationException(
                "Only published jobs can be closed.");
        }

        job.Status = JobStatus.Closed;

        job.UpdatedAt = DateTime.UtcNow;

        await _jobRepository.UpdateAsync(
            job,
            cancellationToken);

        return MapToDto(job);
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private static void ValidateJobData(
        string title,
        string description,
        decimal? salaryMin,
        decimal? salaryMax,
        DateTime applicationDeadline)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException(
                "Job title is required.");
        }

        if (title.Trim().Length > 200)
        {
            throw new ArgumentException(
                "Job title cannot exceed 200 characters.");
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new ArgumentException(
                "Job description is required.");
        }

        if (description.Trim().Length > 10000)
        {
            throw new ArgumentException(
                "Job description cannot exceed 10,000 characters.");
        }

        if (salaryMin.HasValue && salaryMin.Value < 0)
        {
            throw new ArgumentException(
                "Minimum salary cannot be negative.");
        }

        if (salaryMax.HasValue && salaryMax.Value < 0)
        {
            throw new ArgumentException(
                "Maximum salary cannot be negative.");
        }

        if (salaryMin.HasValue &&
            salaryMax.HasValue &&
            salaryMin.Value > salaryMax.Value)
        {
            throw new ArgumentException(
                "Minimum salary cannot be greater than maximum salary.");
        }

        if (applicationDeadline <= DateTime.UtcNow)
        {
            throw new ArgumentException(
                "Application deadline must be in the future.");
        }
    }

    // =========================================================
    // ENTITY → DETAIL DTO
    // =========================================================

    private static JobDto MapToDto(Job job)
    {
        return new JobDto
        {
            Id = job.Id,

            EmployerId = job.EmployerId,

            CompanyId = job.CompanyId,

            CompanyName = job.Company?.Name ?? string.Empty,

            CategoryId = job.CategoryId,

            CategoryName = job.Category?.Name ?? string.Empty,

            Title = job.Title,

            Description = job.Description,

            Requirements = job.Requirements,

            SalaryMin = job.SalaryMin,

            SalaryMax = job.SalaryMax,

            EmploymentType = job.EmploymentType,

            WorkMode = job.WorkMode,

            Location = job.Location,

            ApplicationDeadline = job.ApplicationDeadline,

            Status = job.Status,

            CreatedAt = job.CreatedAt,

            UpdatedAt = job.UpdatedAt
        };
    }

    // =========================================================
    // ENTITY → LIST DTO
    // =========================================================

    private static JobListDto MapToListDto(Job job)
    {
        return new JobListDto
        {
            Id = job.Id,

            CompanyName = job.Company?.Name ?? string.Empty,

            CategoryName = job.Category?.Name ?? string.Empty,

            Title = job.Title,

            EmploymentType = job.EmploymentType,

            WorkMode = job.WorkMode,

            Location = job.Location,

            ApplicationDeadline = job.ApplicationDeadline,

            Status = job.Status,

            CreatedAt = job.CreatedAt
        };
    }
}

