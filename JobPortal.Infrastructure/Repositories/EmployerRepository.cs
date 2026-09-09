using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data.Context;

using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Repositories;

public class EmployerRepository : IEmployerRepository
{
    private readonly JobPortalDbContext _context;

    public EmployerRepository(
        JobPortalDbContext context)
    {
        _context = context;
    }

    public async Task<Employer?> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Employers
            .FirstOrDefaultAsync(
                x => x.UserId == userId,
                cancellationToken);
    }

    public async Task<Employer?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Employers
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task AddAsync(
        Employer employer,
        CancellationToken cancellationToken = default)
    {
        await _context.Employers.AddAsync(
            employer,
            cancellationToken);

        await _context.SaveChangesAsync(
            cancellationToken);
    }

    public async Task UpdateAsync(
        Employer employer,
        CancellationToken cancellationToken = default)
    {
        _context.Employers.Update(employer);

        await _context.SaveChangesAsync(
            cancellationToken);
    }
}