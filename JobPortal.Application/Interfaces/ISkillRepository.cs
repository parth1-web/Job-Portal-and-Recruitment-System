using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface ISkillRepository
{
    Task<Skill?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<Skill?> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Skill>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Skill>> GetByIdsAsync(
        IEnumerable<int> ids,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Skill skill,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Skill skill,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Skill skill,
        CancellationToken cancellationToken = default);
}