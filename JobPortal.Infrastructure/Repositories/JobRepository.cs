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
            .Where(x => x.EmployerId == employerId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Job>> GetPublishedJobsAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.Jobs
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.Category)
            .Where(x => x.Status == JobStatus.Published)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
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
}