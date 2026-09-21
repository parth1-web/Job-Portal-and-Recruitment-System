using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface ISavedJobRepository
{
    Task<SavedJob?> GetAsync(
        int candidateId,
        int jobId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SavedJob>> GetByCandidateIdAsync(
        int candidateId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        SavedJob savedJob,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        SavedJob savedJob,
        CancellationToken cancellationToken = default);
}