using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface ICompanyRepository
{
    Task<Company?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<Company?> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Company>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Company company,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Company company,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Company company,
        CancellationToken cancellationToken = default);
}