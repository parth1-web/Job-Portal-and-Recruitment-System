using JobPortal.Application.DTOs.SavedJobs;

namespace JobPortal.Application.Interfaces;

public interface ISavedJobService
{
    Task<IReadOnlyList<SavedJobDto>> GetSavedJobsAsync(
        int userId,
        CancellationToken cancellationToken = default);

    Task<SavedJobDto> SaveJobAsync(
        int userId,
        int jobId,
        CancellationToken cancellationToken = default);

    Task<bool> UnsaveJobAsync(
        int userId,
        int jobId,
        CancellationToken cancellationToken = default);

    Task<bool> IsJobSavedAsync(
        int userId,
        int jobId,
        CancellationToken cancellationToken = default);
}