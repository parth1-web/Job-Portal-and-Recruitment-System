
using JobPortal.Application.DTOs.Jobs;

namespace JobPortal.Application.Interfaces;

public interface IJobService
{
    Task<JobDto> CreateAsync(
        int employerId,
        CreateJobDto request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<JobListDto>> GetByEmployerIdAsync(
        int employerId,
        CancellationToken cancellationToken = default);

    Task<JobDto?> GetByIdForEmployerAsync(
        int jobId,
        int employerId,
        CancellationToken cancellationToken = default);

    Task<JobDto> UpdateAsync(
        int jobId,
        int employerId,
        UpdateJobDto request,
        CancellationToken cancellationToken = default);

    Task<JobDto> PublishAsync(
        int jobId,
        int employerId,
        CancellationToken cancellationToken = default);

    Task<JobDto> CloseAsync(
        int jobId,
        int employerId,
        CancellationToken cancellationToken = default);
}

