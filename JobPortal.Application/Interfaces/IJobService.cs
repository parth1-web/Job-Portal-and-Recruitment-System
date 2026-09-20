using JobPortal.Application.DTOs.Jobs;
using JobPortal.Application.DTOs.Common;

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
        string jobId,
        CancellationToken cancellationToken = default);

    Task<JobDto?> UpdateAsync(
        int userId,
        string jobId,
        UpdateJobDto dto,
        CancellationToken cancellationToken = default);

    Task<JobDto?> PublishAsync(
        int userId,
        string jobId,
        CancellationToken cancellationToken = default);

    Task<JobDto?> CloseAsync(
        int userId,
        string jobId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<JobListDto>> GetPublishedJobsAsync(
        JobFilterDto filter,
        CancellationToken cancellationToken = default);

    Task<JobDto?> GetPublishedJobByIdAsync(
        string jobId,
        CancellationToken cancellationToken = default);

    Task<List<string>> GetJobCategoriesAsync(CancellationToken cancellationToken = default);
}