using JobPortal.Application.DTOs.Jobs;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Services;

public class JobService : IJobService
{
    private readonly IJobRepository _jobRepository;
    private readonly IEmployerRepository _employerRepository;
    private readonly ISkillRepository _skillRepository;
    private readonly IJobSkillRepository _jobSkillRepository;

    public JobService(
        IJobRepository jobRepository,
        IEmployerRepository employerRepository,
        ISkillRepository skillRepository,
        IJobSkillRepository jobSkillRepository)
    {
        _jobRepository = jobRepository;
        _employerRepository = employerRepository;
        _skillRepository = skillRepository;
        _jobSkillRepository = jobSkillRepository;
    }

    public async Task<JobDto> CreateAsync(
        int userId,
        CreateJobDto dto,
        CancellationToken cancellationToken = default)
    {
        ValidateJobData(
            dto.Title,
            dto.Description,
            dto.SalaryMin,
            dto.SalaryMax,
            dto.ApplicationDeadline);

        var employer =
            await _employerRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (employer is null)
        {
            throw new InvalidOperationException(
                "Employer profile was not found for the authenticated user.");
        }

        if (dto.Skills?.Any() == true)
        {
            var skillIds = dto.Skills.Select(s => s.SkillId).Distinct().ToList();
            var skills = await _skillRepository.GetByIdsAsync(skillIds, cancellationToken);
            
            if (skills.Count != skillIds.Count)
            {
                var missingIds = skillIds.Except(skills.Select(s => s.Id));
                throw new InvalidOperationException(
                    $"The following skill IDs were not found: {string.Join(", ", missingIds)}");
            }
        }

        var job = new Job
        {
            EmployerId = employer.Id,
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

        if (dto.Skills?.Any() == true)
        {
            var jobSkills = dto.Skills.Select(s => new JobSkill
            {
                JobId = job.Id,
                SkillId = s.SkillId,
                IsRequired = s.IsRequired
            });

            await _jobSkillRepository.AddRangeAsync(jobSkills, cancellationToken);
        }

        var createdJob = await _jobRepository.GetByIdAsync(
            job.Id,
            cancellationToken);

        if (createdJob is null)
        {
            throw new InvalidOperationException(
                "The job could not be retrieved after creation.");
        }

        return MapToDto(createdJob);
    }

    public async Task<IReadOnlyList<JobListDto>> GetEmployerJobsAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var employer =
            await _employerRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (employer is null)
        {
            throw new InvalidOperationException(
                "Employer profile was not found for the authenticated user.");
        }

        var jobs =
            await _jobRepository.GetByEmployerIdAsync(
                employer.Id,
                cancellationToken);

        return jobs
            .Select(MapToListDto)
            .ToList();
    }

    public async Task<JobDto?> GetEmployerJobByIdAsync(
        int userId,
        int jobId,
        CancellationToken cancellationToken = default)
    {
        var employer =
            await _employerRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (employer is null)
        {
            return null;
        }

        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobId,
                employer.Id,
                cancellationToken);

        return job is null
            ? null
            : MapToDto(job);
    }

    public async Task<JobDto?> UpdateAsync(
        int userId,
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

        var employer =
            await _employerRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (employer is null)
        {
            return null;
        }

        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobId,
                employer.Id,
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

        if (dto.Skills?.Any() == true)
        {
            var skillIds = dto.Skills.Select(s => s.SkillId).Distinct().ToList();
            var skills = await _skillRepository.GetByIdsAsync(skillIds, cancellationToken);

            if (skills.Count != skillIds.Count)
            {
                var missingIds = skillIds.Except(skills.Select(s => s.Id));
                throw new InvalidOperationException(
                    $"The following skill IDs were not found: {string.Join(", ", missingIds)}");
            }
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

        if (dto.Skills != null)
        {
            await _jobSkillRepository.DeleteByJobIdAsync(jobId, cancellationToken);

            if (dto.Skills.Any())
            {
                var jobSkills = dto.Skills.Select(s => new JobSkill
                {
                    JobId = job.Id,
                    SkillId = s.SkillId,
                    IsRequired = s.IsRequired
                });

                await _jobSkillRepository.AddRangeAsync(jobSkills, cancellationToken);
            }
        }

        return MapToDto(job);
    }

    public async Task<JobDto?> PublishAsync(
        int userId,
        int jobId,
        CancellationToken cancellationToken = default)
    {
        var employer =
            await _employerRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (employer is null)
        {
            return null;
        }

        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobId,
                employer.Id,
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
        int userId,
        int jobId,
        CancellationToken cancellationToken = default)
    {
        var employer =
            await _employerRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (employer is null)
        {
            return null;
        }

        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobId,
                employer.Id,
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