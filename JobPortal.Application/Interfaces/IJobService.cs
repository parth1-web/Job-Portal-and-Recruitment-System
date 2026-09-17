using JobPortal.Application.DTOs.Jobs;

namespace JobPortal.Application.Interfaces;

public interface IJobService
{
    Task<JobDto> CreateAsync(
        int userId,
        CreateJobDto dto,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<JobListDto>> GetEmployerJobsAsync(
        int userId,
        CancellationToken cancellationToken = default);

    Task<JobDto?> GetEmployerJobByIdAsync(
        int userId,
        int jobId,
        CancellationToken cancellationToken = default);

    Task<JobDto?> UpdateAsync(
        int userId,
        int jobId,
        UpdateJobDto dto,
        CancellationToken cancellationToken = default);

    Task<JobDto?> PublishAsync(
        int userId,
        int jobId,
        CancellationToken cancellationToken = default);

    Task<JobDto?> CloseAsync(
        int userId,
        int jobId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<JobListDto>> GetPublishedJobsAsync(
        CancellationToken cancellationToken = default);

    Task<JobDto?> GetPublishedJobByIdAsync(
        int jobId,
        CancellationToken cancellationToken = default);
}