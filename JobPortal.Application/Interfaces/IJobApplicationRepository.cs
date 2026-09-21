using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface IJobApplicationRepository
{
    Task<JobApplication?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<JobApplication?> GetByIdWithDetailsAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<JobApplication>> GetByCandidateIdAsync(
        int candidateId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<JobApplication>> GetByJobIdAsync(
        int jobId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        int jobId,
        int candidateId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        JobApplication application,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        JobApplication application,
        CancellationToken cancellationToken = default);
}