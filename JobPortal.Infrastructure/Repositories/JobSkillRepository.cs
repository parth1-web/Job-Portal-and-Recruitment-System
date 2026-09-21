using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories;

public class JobSkillRepository : IJobSkillRepository
{
    private readonly JobPortalDbContext _context;

    public JobSkillRepository(JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<JobSkill>> GetByJobIdAsync(
        int jobId,
        CancellationToken cancellationToken = default)
    {
        return await _context.JobSkills
            .AsNoTracking()
            .Where(x => x.JobId == jobId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddRangeAsync(
        IEnumerable<JobSkill> jobSkills,
        CancellationToken cancellationToken = default)
    {
        await _context.JobSkills.AddRangeAsync(jobSkills, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByJobIdAsync(
        int jobId,
        CancellationToken cancellationToken = default)
    {
        var jobSkills = await _context.JobSkills
            .Where(x => x.JobId == jobId)
            .ToListAsync(cancellationToken);

        _context.JobSkills.RemoveRange(jobSkills);
        await _context.SaveChangesAsync(cancellationToken);
    }
}