using JobPortal.Application.DTOs.Employers;

namespace JobPortal.Application.Interfaces;

public interface IEmployerService
{
    Task<EmployerProfileDto?> GetProfileAsync(
        int userId,
        CancellationToken cancellationToken = default);

    Task<EmployerProfileDto> CreateProfileAsync(
        int userId,
        UpdateEmployerProfileDto request,
        CancellationToken cancellationToken = default);

    Task<EmployerProfileDto> UpdateProfileAsync(
        int userId,
        UpdateEmployerProfileDto request,
        CancellationToken cancellationToken = default);
}