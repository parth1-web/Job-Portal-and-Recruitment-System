using JobPortal.Application.DTOs.Resumes;

namespace JobPortal.Application.Interfaces;

public interface IResumeService
{
    Task<ResumeDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ResumeDto>> GetByCandidateIdAsync(
        int candidateId,
        CancellationToken cancellationToken = default);

    Task<ResumeDto> CreateAsync(
        int candidateId,
        CreateResumeDto dto,
        CancellationToken cancellationToken = default);

    Task<ResumeDto?> UpdateAsync(
        int candidateId,
        int resumeId,
        UpdateResumeDto dto,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        int candidateId,
        int resumeId,
        CancellationToken cancellationToken = default);
}