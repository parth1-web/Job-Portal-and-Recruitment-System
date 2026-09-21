using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface IResumeRepository
{
    Task<Resume?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Resume>> GetByCandidateIdAsync(
        int candidateId,
        CancellationToken cancellationToken = default);

    Task<Resume?> GetDefaultByCandidateIdAsync(
        int candidateId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Resume resume,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Resume resume,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Resume resume,
        CancellationToken cancellationToken = default);
}