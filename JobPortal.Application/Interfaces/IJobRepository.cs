using JobPortal.Application.DTOs.Jobs;
using JobPortal.Application.DTOs.Common;
using JobPortal.Domain.Entities;


namespace JobPortal.Application.Interfaces;

public interface IJobRepository
{
    Task<Job?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<Job?> GetByIdForEmployerAsync(
        int jobId,
        int employerId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Job>> GetByEmployerIdAsync(
        int employerId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<Job>> GetPublishedJobsAsync(
        JobFilterDto filter,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Job job,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Job job,
        CancellationToken cancellationToken = default);

    Task<List<string>> GetCategoriesAsync(CancellationToken cancellationToken = default);
}