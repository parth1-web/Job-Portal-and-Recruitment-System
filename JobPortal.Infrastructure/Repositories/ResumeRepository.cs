using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories;

public class ResumeRepository : IResumeRepository
{
    private readonly JobPortalDbContext _context;

    public ResumeRepository(JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<Resume?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Resumes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Resume>> GetByCandidateIdAsync(
        int candidateId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Resumes
            .AsNoTracking()
            .Where(x => x.CandidateId == candidateId)
            .OrderByDescending(x => x.UploadedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Resume?> GetDefaultByCandidateIdAsync(
        int candidateId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Resumes
            .FirstOrDefaultAsync(x => x.CandidateId == candidateId && x.IsDefault, cancellationToken);
    }

    public async Task AddAsync(
        Resume resume,
        CancellationToken cancellationToken = default)
    {
        await _context.Resumes.AddAsync(resume, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        Resume resume,
        CancellationToken cancellationToken = default)
    {
        _context.Resumes.Update(resume);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        Resume resume,
        CancellationToken cancellationToken = default)
    {
        _context.Resumes.Remove(resume);
        await _context.SaveChangesAsync(cancellationToken);
    }
}