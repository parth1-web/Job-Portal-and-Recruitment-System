using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface IInterviewRepository
{
    Task<Interview?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Interview>> GetByApplicationIdAsync(
        int applicationId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Interview interview,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Interview interview,
        CancellationToken cancellationToken = default);
}