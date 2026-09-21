using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface IEmployerRepository
{
    Task<Employer?> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default);

    Task<Employer?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Employer employer,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Employer employer,
        CancellationToken cancellationToken = default);
}