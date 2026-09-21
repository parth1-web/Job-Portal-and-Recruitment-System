using JobPortal.Application.DTOs.Interviews;

namespace JobPortal.Application.Interfaces;

public interface IInterviewService
{
    Task<InterviewDto> ScheduleAsync(
        int userId,
        CreateInterviewDto dto,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<InterviewDto>> GetByApplicationIdAsync(
        int applicationId,
        CancellationToken cancellationToken = default);

    Task<InterviewDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<InterviewDto?> UpdateAsync(
        int userId,
        int interviewId,
        UpdateInterviewDto dto,
        CancellationToken cancellationToken = default);

    Task CancelAsync(
        int userId,
        int interviewId,
        CancellationToken cancellationToken = default);
}