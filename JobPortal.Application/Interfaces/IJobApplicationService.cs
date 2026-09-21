using JobPortal.Application.DTOs.Applications;

namespace JobPortal.Application.Interfaces;

public interface IJobApplicationService
{
    Task<JobApplicationDto> ApplyAsync(
        int userId,
        CreateJobApplicationDto dto,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<JobApplicationListDto>> GetMyApplicationsAsync(
        int userId,
        CancellationToken cancellationToken = default);

    Task<JobApplicationDto?> GetApplicationByIdAsync(
        int userId,
        string applicationId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<JobApplicationListDto>> GetApplicationsForJobAsync(
        int userId,
        string jobId,
        CancellationToken cancellationToken = default);

    Task<JobApplicationDto?> UpdateStatusAsync(
        int userId,
        string applicationId,
        UpdateJobApplicationStatusDto dto,
        CancellationToken cancellationToken = default);

    Task WithdrawAsync(
        int userId,
        string applicationId,
        CancellationToken cancellationToken = default);
}