using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories;

public class InterviewRepository : IInterviewRepository
{
    private readonly JobPortalDbContext _context;

    public InterviewRepository(JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<Interview?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Interviews
            .AsNoTracking()
            .Include(x => x.Application)
                .ThenInclude(a => a.Job)
                    .ThenInclude(j => j.Company)
            .Include(x => x.Application)
                .ThenInclude(a => a.Candidate)
                    .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Interview>> GetByApplicationIdAsync(
        int applicationId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Interviews
            .AsNoTracking()
            .Include(x => x.Application)
                .ThenInclude(a => a.Job)
                    .ThenInclude(j => j.Company)
            .Include(x => x.Application)
                .ThenInclude(a => a.Candidate)
                    .ThenInclude(c => c.User)
            .Where(x => x.ApplicationId == applicationId)
            .OrderBy(x => x.ScheduledAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(
        Interview interview,
        CancellationToken cancellationToken = default)
    {
        await _context.Interviews.AddAsync(interview, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        Interview interview,
        CancellationToken cancellationToken = default)
    {
        _context.Interviews.Update(interview);
        await _context.SaveChangesAsync(cancellationToken);
    }
}