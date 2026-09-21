using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface ICandidateRepository
{
    Task<Candidate?> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default);

    Task<Candidate?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Candidate candidate,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Candidate candidate,
        CancellationToken cancellationToken = default);
}