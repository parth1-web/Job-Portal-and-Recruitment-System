using JobPortal.Application.DTOs.Candidates;

namespace JobPortal.Application.Interfaces;

public interface ICandidateService
{
    Task<CandidateProfileDto?> GetProfileAsync(
        int userId,
        CancellationToken cancellationToken = default);

    Task<CandidateProfileDto> CreateProfileAsync(
        int userId,
        UpdateCandidateProfileDto request,
        CancellationToken cancellationToken = default);

    Task<CandidateProfileDto> UpdateProfileAsync(
        int userId,
        UpdateCandidateProfileDto request,
        CancellationToken cancellationToken = default);
}