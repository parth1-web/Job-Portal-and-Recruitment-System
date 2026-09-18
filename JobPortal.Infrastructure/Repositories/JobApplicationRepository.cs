using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories;

public class JobApplicationRepository : IJobApplicationRepository
{
    private readonly JobPortalDbContext _context;

    public JobApplicationRepository(JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<JobApplication?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.JobApplications
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<JobApplication?> GetByIdWithDetailsAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.JobApplications
            .Include(x => x.Job)
                .ThenInclude(j => j.Company)
            .Include(x => x.Job)
                .ThenInclude(j => j.Employer)
                    .ThenInclude(e => e.User)
            .Include(x => x.Candidate)
                .ThenInclude(c => c.User)
            .Include(x => x.Resume)
            .Include(x => x.StatusHistory)
                .ThenInclude(h => h.ChangedByUser)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<JobApplication>> GetByCandidateIdAsync(
        int candidateId,
        CancellationToken cancellationToken = default)
    {
        return await _context.JobApplications
            .AsNoTracking()
            .Include(x => x.Job)
                .ThenInclude(j => j.Company)
            .Where(x => x.CandidateId == candidateId)
            .OrderByDescending(x => x.AppliedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<JobApplication>> GetByJobIdAsync(
        int jobId,
        CancellationToken cancellationToken = default)
    {
        return await _context.JobApplications
            .AsNoTracking()
            .Include(x => x.Candidate)
                .ThenInclude(c => c.User)
            .Include(x => x.Resume)
            .Where(x => x.JobId == jobId)
            .OrderByDescending(x => x.AppliedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        int jobId,
        int candidateId,
        CancellationToken cancellationToken = default)
    {
        return await _context.JobApplications
            .AnyAsync(x => x.JobId == jobId && x.CandidateId == candidateId, cancellationToken);
    }

    public async Task AddAsync(
        JobApplication application,
        CancellationToken cancellationToken = default)
    {
        await _context.JobApplications.AddAsync(application, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        JobApplication application,
        CancellationToken cancellationToken = default)
    {
        _context.JobApplications.Update(application);
        await _context.SaveChangesAsync(cancellationToken);
    }
}