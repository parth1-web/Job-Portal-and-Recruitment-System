using JobPortal.Application.DTOs.Jobs;

namespace JobPortal.Application.Interfaces;

public interface IJobService
{
    Task<JobDto> CreateAsync(
        int employerId,
        CreateJobDto dto,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<JobListDto>> GetEmployerJobsAsync(
        int employerId,
        CancellationToken cancellationToken = default);

    Task<JobDto?> GetEmployerJobByIdAsync(
        int employerId,
        int jobId,
        CancellationToken cancellationToken = default);

    Task<JobDto?> UpdateAsync(
        int employerId,
        int jobId,
        UpdateJobDto dto,
        CancellationToken cancellationToken = default);

    Task<JobDto?> PublishAsync(
        int employerId,
        int jobId,
        CancellationToken cancellationToken = default);

    Task<JobDto?> CloseAsync(
        int employerId,
        int jobId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<JobListDto>> GetPublishedJobsAsync(
        CancellationToken cancellationToken = default);

    Task<JobDto?> GetPublishedJobByIdAsync(
        int jobId,
        CancellationToken cancellationToken = default);
}