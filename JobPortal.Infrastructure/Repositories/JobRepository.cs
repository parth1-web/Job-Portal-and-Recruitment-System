using JobPortal.Application.DTOs.Jobs;
using JobPortal.Application.DTOs.Common;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;
using JobPortal.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories;

public class JobRepository : IJobRepository
{
    private readonly JobPortalDbContext _context;

    public JobRepository(JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<Job?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Jobs
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.Category)
            .Include(x => x.Employer)
            .Include(x => x.JobSkills)
                .ThenInclude(js => js.Skill)
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<Job?> GetByIdForEmployerAsync(
        int jobId,
        int employerId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Jobs
            .Include(x => x.Company)
            .Include(x => x.Category)
            .Include(x => x.Employer)
            .Include(x => x.JobSkills)
                .ThenInclude(js => js.Skill)
            .FirstOrDefaultAsync(
                x => x.Id == jobId &&
                     x.EmployerId == employerId,
                cancellationToken);
    }

    public async Task<IReadOnlyList<Job>> GetByEmployerIdAsync(
        int employerId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Jobs
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.Category)
            .Include(x => x.JobSkills)
                .ThenInclude(js => js.Skill)
            .Where(x => x.EmployerId == employerId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<Job>> GetPublishedJobsAsync(
        JobFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Jobs
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.Category)
            .Include(x => x.JobSkills)
                .ThenInclude(js => js.Skill)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            query = query.Where(x => x.Title.Contains(filter.SearchTerm) ||
                                     x.Description.Contains(filter.SearchTerm) ||
                                     x.Company.Name.Contains(filter.SearchTerm));
        }

        if (!string.IsNullOrWhiteSpace(filter.Location))
        {
            query = query.Where(x => x.Location != null && x.Location.Contains(filter.Location));
        }

        if (!string.IsNullOrWhiteSpace(filter.WorkMode))
        {
            if (Enum.TryParse<WorkMode>(filter.WorkMode, true, out var workMode))
            {
                query = query.Where(x => x.WorkMode == workMode);
            }
        }

        if (!string.IsNullOrWhiteSpace(filter.EmploymentType))
        {
            if (Enum.TryParse<EmploymentType>(filter.EmploymentType, true, out var empType))
            {
                query = query.Where(x => x.EmploymentType == empType);
            }
        }

        if (filter.MinSalary.HasValue)
        {
            query = query.Where(x => x.SalaryMax >= filter.MinSalary.Value);
        }

        if (filter.MaxSalary.HasValue)
        {
            query = query.Where(x => x.SalaryMin <= filter.MaxSalary.Value);
        }

        if (filter.SkillIds?.Any() == true)
        {
            var skillIds = filter.SkillIds.Select(int.Parse).ToList();
            query = query.Where(x => x.JobSkills.Any(js => skillIds.Contains(js.SkillId)));
        }

        if (!string.IsNullOrWhiteSpace(filter.CompanyId) && int.TryParse(filter.CompanyId, out var companyId))
        {
            query = query.Where(x => x.CompanyId == companyId);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            if (Enum.TryParse<JobStatus>(filter.Status, true, out var status))
            {
                query = query.Where(x => x.Status == status);
            }
        }
        else
        {
            query = query.Where(x => x.Status == JobStatus.Published);
        }

        query = ApplySorting(query, filter.SortBy, filter.SortDirection);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Job>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    private static IQueryable<Job> ApplySorting(IQueryable<Job> query, string sortBy, string sortDirection)
    {
        var isDescending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        return sortBy?.ToLowerInvariant() switch
        {
            "title" => isDescending ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
            "salary" => isDescending ? query.OrderByDescending(x => x.SalaryMax) : query.OrderBy(x => x.SalaryMax),
            "location" => isDescending ? query.OrderByDescending(x => x.Location) : query.OrderBy(x => x.Location),
            "posteddate" => isDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            _ => isDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
        };
    }

    public async Task AddAsync(
        Job job,
        CancellationToken cancellationToken = default)
    {
        await _context.Jobs.AddAsync(
            job,
            cancellationToken);

        await _context.SaveChangesAsync(
            cancellationToken);
    }

    public async Task UpdateAsync(
        Job job,
        CancellationToken cancellationToken = default)
    {
        _context.Jobs.Update(job);

        await _context.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<List<string>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.JobCategories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => c.Name)
            .ToListAsync(cancellationToken);
    }
}