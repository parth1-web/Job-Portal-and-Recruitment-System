using JobPortal.Application.DTOs.Jobs;
using JobPortal.Application.DTOs.Common;
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
            var skillIds = dto.Skills.Select(s => int.Parse(s.SkillId)).Distinct().ToList();
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
            CompanyId = int.TryParse(dto.CompanyId, out var cid) ? cid : null,
            CategoryId = int.TryParse(dto.CategoryId, out var catid) ? catid : null,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Requirements = dto.Requirements?.Trim(),
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            EmploymentType = ParseEmploymentType(dto.EmploymentType),
            WorkMode = ParseWorkMode(dto.WorkMode),
            Location = dto.Location?.Trim(),
            ApplicationDeadline = NormalizeToUtc(dto.ApplicationDeadline) ?? DateTime.UtcNow.AddDays(30),
            Status = ParseJobStatus(dto.Status),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _jobRepository.AddAsync(
            job,
            cancellationToken);

        if (dto.Skills?.Any() == true)
        {
            var jobSkills = dto.Skills.Select(s => new JobSkill
            {
                JobId = job.Id,
                SkillId = int.Parse(s.SkillId),
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
        string jobId,
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

        if (!int.TryParse(jobId, out var jobIdInt))
        {
            return null;
        }

        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobIdInt,
                employer.Id,
                cancellationToken);

        return job is null
            ? null
            : MapToDto(job);
    }

    public async Task<JobDto?> UpdateAsync(
        int userId,
        string jobId,
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

        if (!int.TryParse(jobId, out var jobIdInt))
        {
            return null;
        }

        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobIdInt,
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
            var skillIds = dto.Skills.Select(s => int.Parse(s.SkillId)).Distinct().ToList();
            var skills = await _skillRepository.GetByIdsAsync(skillIds, cancellationToken);

            if (skills.Count != skillIds.Count)
            {
                var missingIds = skillIds.Except(skills.Select(s => s.Id));
                throw new InvalidOperationException(
                    $"The following skill IDs were not found: {string.Join(", ", missingIds)}");
            }
        }

        job.CompanyId = int.TryParse(dto.CompanyId, out var cid) ? cid : null;
        job.CategoryId = int.TryParse(dto.CategoryId, out var catid) ? catid : null;
        job.Title = dto.Title.Trim();
        job.Description = dto.Description.Trim();
        job.Requirements = dto.Requirements?.Trim();
        job.SalaryMin = dto.SalaryMin;
        job.SalaryMax = dto.SalaryMax;
        job.EmploymentType = ParseEmploymentType(dto.EmploymentType);
        job.WorkMode = ParseWorkMode(dto.WorkMode);
        job.Location = dto.Location?.Trim();
        job.ApplicationDeadline = NormalizeToUtc(dto.ApplicationDeadline) ?? DateTime.UtcNow.AddDays(30);
        job.UpdatedAt = DateTime.UtcNow;

        await _jobRepository.UpdateAsync(
            job,
            cancellationToken);

        if (dto.Skills != null)
        {
            await _jobSkillRepository.DeleteByJobIdAsync(jobIdInt, cancellationToken);

            if (dto.Skills.Any())
            {
                var jobSkills = dto.Skills.Select(s => new JobSkill
                {
                    JobId = job.Id,
                    SkillId = int.Parse(s.SkillId),
                    IsRequired = s.IsRequired
                });

                await _jobSkillRepository.AddRangeAsync(jobSkills, cancellationToken);
            }
        }

        return MapToDto(job);
    }

    public async Task<JobDto?> PublishAsync(
        int userId,
        string jobId,
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

        if (!int.TryParse(jobId, out var jobIdInt))
        {
            return null;
        }

        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobIdInt,
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
        string jobId,
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

        if (!int.TryParse(jobId, out var jobIdInt))
        {
            return null;
        }

        var job =
            await _jobRepository.GetByIdForEmployerAsync(
                jobIdInt,
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

    public async Task<PagedResult<JobListDto>> GetPublishedJobsAsync(
        JobFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        var result = await _jobRepository.GetPublishedJobsAsync(filter, cancellationToken);

        return new PagedResult<JobListDto>
        {
            Items = result.Items.Select(MapToListDto).ToList(),
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize
        };
    }

    public async Task<JobDto?> GetPublishedJobByIdAsync(
        string jobId,
        CancellationToken cancellationToken = default)
    {
        if (!int.TryParse(jobId, out var jobIdInt))
        {
            return null;
        }

        var job =
            await _jobRepository.GetByIdAsync(
                jobIdInt,
                cancellationToken);

        if (job is null ||
            job.Status != JobStatus.Published)
        {
            return null;
        }

        return MapToDto(job);
    }

    public async Task<List<string>> GetJobCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _jobRepository.GetCategoriesAsync(cancellationToken);
    }

    private static void ValidateJobData(
        string title,
        string description,
        decimal? salaryMin,
        decimal? salaryMax,
        DateTime? applicationDeadline)
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

        if (applicationDeadline.HasValue && applicationDeadline.Value <= DateTime.UtcNow)
        {
            throw new InvalidOperationException(
                "Application deadline must be in the future.");
        }
    }

    /// <summary>
    /// Browsers submit date inputs without an offset (Kind=Unspecified),
    /// which Npgsql refuses to write to timestamptz columns. Treat such values as UTC.
    /// </summary>
    private static DateTime? NormalizeToUtc(DateTime? value)
    {
        if (value is null)
        {
            return null;
        }

        return value.Value.Kind switch
        {
            DateTimeKind.Utc => value.Value,
            DateTimeKind.Local => value.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
        };
    }

    private static EmploymentType ParseEmploymentType(string? value)
    {
        return value switch
        {
            "FullTime" => EmploymentType.FullTime,
            "PartTime" => EmploymentType.PartTime,
            "Contract" => EmploymentType.Contract,
            "Internship" => EmploymentType.Internship,
            _ => EmploymentType.FullTime
        };
    }

    private static WorkMode ParseWorkMode(string? value)
    {
        return value switch
        {
            "Remote" => WorkMode.Remote,
            "OnSite" => WorkMode.OnSite,
            "Hybrid" => WorkMode.Hybrid,
            _ => WorkMode.OnSite
        };
    }

    private static JobStatus ParseJobStatus(string? value)
    {
        return value switch
        {
            "Published" => JobStatus.Published,
            "Closed" => JobStatus.Closed,
            _ => JobStatus.Draft
        };
    }

    private static JobDto MapToDto(Job job)
    {
        var skills = job.JobSkills?.Select(js => js.Skill.Name).ToList() ?? new List<string>();
        
        return new JobDto
        {
            Id = job.Id.ToString(),
            EmployerId = job.EmployerId.ToString(),
            CompanyId = job.CompanyId.HasValue ? job.CompanyId.Value.ToString() : string.Empty,
            CompanyName = job.Company?.Name ?? string.Empty,
            CompanyLogoUrl = job.Company?.LogoUrl ?? string.Empty,
            CompanyDescription = job.Company?.Description ?? string.Empty,
            CompanyWebsite = string.Empty,
            CompanySize = string.Empty,
            CompanyIndustry = string.Empty,
            CategoryId = job.CategoryId.HasValue ? job.CategoryId.Value.ToString() : string.Empty,
            CategoryName = job.Category?.Name ?? string.Empty,
            Title = job.Title,
            Description = job.Description,
            Requirements = job.Requirements ?? string.Empty,
            Benefits = string.Empty,
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax,
            Currency = "USD",
            EmploymentType = job.EmploymentType.ToString(),
            WorkMode = job.WorkMode.ToString(),
            Location = job.Location ?? string.Empty,
            Responsibilities = new List<string>(),
            PreferredQualifications = new List<string>(),
            ApplicationDeadline = job.ApplicationDeadline,
            Status = job.Status.ToString(),
            CreatedAt = job.CreatedAt,
            UpdatedAt = job.UpdatedAt,
            Skills = skills
        };
    }

    private static JobListDto MapToListDto(Job job)
    {
        var skills = job.JobSkills?.Select(js => js.Skill.Name).ToList() ?? new List<string>();
        
        return new JobListDto
        {
            Id = job.Id.ToString(),
            CompanyId = job.CompanyId.HasValue ? job.CompanyId.Value.ToString() : string.Empty,
            CompanyName = job.Company?.Name ?? string.Empty,
            CompanyLogoUrl = job.Company?.LogoUrl ?? string.Empty,
            CategoryId = job.CategoryId.HasValue ? job.CategoryId.Value.ToString() : string.Empty,
            CategoryName = job.Category?.Name ?? string.Empty,
            Title = job.Title,
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax,
            Currency = "USD",
            EmploymentType = job.EmploymentType.ToString(),
            WorkMode = job.WorkMode.ToString(),
            Location = job.Location ?? string.Empty,
            PostedDate = job.CreatedAt,
            ExpiryDate = job.ApplicationDeadline,
            ApplicationsCount = job.JobApplications?.Count ?? 0,
            ViewsCount = 0,
            IsSaved = false,
            Skills = skills,
            Status = job.Status.ToString()
        };
    }
}