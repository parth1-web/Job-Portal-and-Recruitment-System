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

    public async Task<JobDto> CreateAsync(
        int employerId,
        CreateJobDto dto,
        CancellationToken cancellationToken = default)
    {
        ValidateJobData(
            dto.Title,
            dto.Description,
            dto.SalaryMin,
            dto.SalaryMax,
            dto.ApplicationDeadline);

        var job = new Job
        {
            EmployerId = employerId,
            CompanyId = dto.CompanyId,
            CategoryId = dto.CategoryId,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Requirements = dto.Requirements?.Trim(),
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            EmploymentType = dto.EmploymentType,
            WorkMode = dto.WorkMode,
            Location = dto.Location?.Trim(),
            ApplicationDeadline = dto.ApplicationDeadline,
            Status = JobStatus.Draft
        };

        await _jobRepository.AddAsync(
            job,
            cancellationToken);

        return MapToDto(job);
    }

    public async Task<IReadOnlyList<JobListDto>> GetEmployerJobsAsync(
        int employerId,
        CancellationToken cancellationToken = default)
    {
        var jobs =
            await _jobRepository.GetByEmployerIdAsync(
                employerId,
                cancellationToken);

        return jobs
            .Select(MapToListDto)
            .ToList();
    }

    public async Task<JobDto?> GetEmployerJobByIdAsync(
        int employerId,
        int jobId,
        CancellationToken cancellationToken = default)
    {
        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobId,
                employerId,
                cancellationToken);

        return job is null
            ? null
            : MapToDto(job);
    }

    public async Task<JobDto?> UpdateAsync(
        int employerId,
        int jobId,
        UpdateJobDto dto,
        CancellationToken cancellationToken = default)
    {
        ValidateJobData(
            dto.Title,
            dto.Description,
            dto.SalaryMin,
            dto.SalaryMax,
            dto.ApplicationDeadline);

        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobId,
                employerId,
                cancellationToken);

        if (job is null)
        {
            return null;
        }

        if (job.Status != JobStatus.Draft)
        {
            throw new InvalidOperationException(
                "Only draft jobs can be updated.");
        }

        job.CompanyId = dto.CompanyId;
        job.CategoryId = dto.CategoryId;
        job.Title = dto.Title.Trim();
        job.Description = dto.Description.Trim();
        job.Requirements = dto.Requirements?.Trim();
        job.SalaryMin = dto.SalaryMin;
        job.SalaryMax = dto.SalaryMax;
        job.EmploymentType = dto.EmploymentType;
        job.WorkMode = dto.WorkMode;
        job.Location = dto.Location?.Trim();
        job.ApplicationDeadline = dto.ApplicationDeadline;
        job.UpdatedAt = DateTime.UtcNow;

        await _jobRepository.UpdateAsync(
            job,
            cancellationToken);

        return MapToDto(job);
    }

    public async Task<JobDto?> PublishAsync(
        int employerId,
        int jobId,
        CancellationToken cancellationToken = default)
    {
        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobId,
                employerId,
                cancellationToken);

        if (job is null)
        {
            return null;
        }

        if (job.Status != JobStatus.Draft)
        {
            throw new InvalidOperationException(
                "Only draft jobs can be published.");
        }

        if (job.ApplicationDeadline <= DateTime.UtcNow)
        {
            throw new InvalidOperationException(
                "Application deadline must be in the future.");
        }

        job.Status = JobStatus.Published;
        job.UpdatedAt = DateTime.UtcNow;

        await _jobRepository.UpdateAsync(
            job,
            cancellationToken);

        return MapToDto(job);
    }

    public async Task<JobDto?> CloseAsync(
        int employerId,
        int jobId,
        CancellationToken cancellationToken = default)
    {
        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobId,
                employerId,
                cancellationToken);

        if (job is null)
        {
            return null;
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

    public async Task<IReadOnlyList<JobListDto>> GetPublishedJobsAsync(
        CancellationToken cancellationToken = default)
    {
        var jobs =
            await _jobRepository.GetPublishedJobsAsync(
                cancellationToken);

        return jobs
            .Select(MapToListDto)
            .ToList();
    }

    public async Task<JobDto?> GetPublishedJobByIdAsync(
        int jobId,
        CancellationToken cancellationToken = default)
    {
        var job =
            await _jobRepository.GetByIdAsync(
                jobId,
                cancellationToken);

        if (job is null ||
            job.Status != JobStatus.Published)
        {
            return null;
        }

        return MapToDto(job);
    }

    private static void ValidateJobData(
        string title,
        string description,
        decimal? salaryMin,
        decimal? salaryMax,
        DateTime applicationDeadline)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new InvalidOperationException(
                "Job title is required.");
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new InvalidOperationException(
                "Job description is required.");
        }

        if (salaryMin.HasValue &&
            salaryMin.Value < 0)
        {
            throw new InvalidOperationException(
                "Minimum salary cannot be negative.");
        }

        if (salaryMax.HasValue &&
            salaryMax.Value < 0)
        {
            throw new InvalidOperationException(
                "Maximum salary cannot be negative.");
        }

        if (salaryMin.HasValue &&
            salaryMax.HasValue &&
            salaryMin.Value > salaryMax.Value)
        {
            throw new InvalidOperationException(
                "Minimum salary cannot be greater than maximum salary.");
        }

        if (applicationDeadline <= DateTime.UtcNow)
        {
            throw new InvalidOperationException(
                "Application deadline must be in the future.");
        }
    }

    private static JobDto MapToDto(Job job)
    {
        return new JobDto
        {
            Id = job.Id,
            EmployerId = job.EmployerId,
            CompanyId = job.CompanyId,
            CompanyName = job.Company.Name,
            CategoryId = job.CategoryId,
            CategoryName = job.Category.Name,
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

    private static JobListDto MapToListDto(Job job)
    {
        return new JobListDto
        {
            Id = job.Id,
            CompanyId = job.CompanyId,
            CompanyName = job.Company.Name,
            CategoryId = job.CategoryId,
            CategoryName = job.Category.Name,
            Title = job.Title,
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax,
            EmploymentType = job.EmploymentType,
            WorkMode = job.WorkMode,
            Location = job.Location,
            ApplicationDeadline = job.ApplicationDeadline,
            Status = job.Status,
            CreatedAt = job.CreatedAt
        };
    }
}