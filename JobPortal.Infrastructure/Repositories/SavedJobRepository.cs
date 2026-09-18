using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories;

public class SavedJobRepository : ISavedJobRepository
{
    private readonly JobPortalDbContext _context;

    public SavedJobRepository(JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<SavedJob?> GetAsync(
        int candidateId,
        int jobId,
        CancellationToken cancellationToken = default)
    {
        return await _context.SavedJobs
            .FirstOrDefaultAsync(x => x.CandidateId == candidateId && x.JobId == jobId, cancellationToken);
    }

    public async Task<IReadOnlyList<SavedJob>> GetByCandidateIdAsync(
        int candidateId,
        CancellationToken cancellationToken = default)
    {
        return await _context.SavedJobs
            .Include(x => x.Job)
                .ThenInclude(j => j.Company)
            .Where(x => x.CandidateId == candidateId)
            .OrderByDescending(x => x.SavedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(
        SavedJob savedJob,
        CancellationToken cancellationToken = default)
    {
        await _context.SavedJobs.AddAsync(savedJob, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        SavedJob savedJob,
        CancellationToken cancellationToken = default)
    {
        _context.SavedJobs.Remove(savedJob);
        await _context.SaveChangesAsync(cancellationToken);
    }
}