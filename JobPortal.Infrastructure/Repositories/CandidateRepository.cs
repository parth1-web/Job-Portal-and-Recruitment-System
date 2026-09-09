using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data.Context;

using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories;

public class CandidateRepository : ICandidateRepository
{
    private readonly JobPortalDbContext _context;

    public CandidateRepository(JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<Candidate?> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Candidates
            .FirstOrDefaultAsync(
                x => x.UserId == userId,
                cancellationToken);
    }

    public async Task<Candidate?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Candidates
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task AddAsync(
        Candidate candidate,
        CancellationToken cancellationToken = default)
    {
        await _context.Candidates.AddAsync(
            candidate,
            cancellationToken);

        await _context.SaveChangesAsync(
            cancellationToken);
    }

    public async Task UpdateAsync(
        Candidate candidate,
        CancellationToken cancellationToken = default)
    {
        _context.Candidates.Update(candidate);

        await _context.SaveChangesAsync(
            cancellationToken);
    }
}