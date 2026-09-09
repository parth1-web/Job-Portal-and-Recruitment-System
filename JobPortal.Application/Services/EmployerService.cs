using JobPortal.Application.DTOs.Employers;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Services;

public class EmployerService : IEmployerService
{
    private readonly IEmployerRepository _employerRepository;
    private readonly IUserRepository _userRepository;

    public EmployerService(
        IEmployerRepository employerRepository,
        IUserRepository userRepository)
    {
        _employerRepository = employerRepository;
        _userRepository = userRepository;
    }

    public async Task<EmployerProfileDto?> GetProfileAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var employer =
            await _employerRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (employer is null)
        {
            return null;
        }

        var user =
            await _userRepository.GetByIdAsync(userId);

        if (user is null)
        {
            return null;
        }

        return MapToDto(employer, user.Email);
    }

    public async Task<EmployerProfileDto> CreateProfileAsync(
        int userId,
        UpdateEmployerProfileDto request,
        CancellationToken cancellationToken = default)
    {
        var existing =
            await _employerRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (existing is not null)
        {
            throw new InvalidOperationException(
                "Employer profile already exists.");
        }

        var user =
            await _userRepository.GetByIdAsync(userId);

        if (user is null)
        {
            throw new InvalidOperationException(
                "User not found.");
        }

        var employer = new Employer
        {
            UserId = userId,
            CompanyName = request.CompanyName,
            CompanyDescription = request.CompanyDescription,
            Website = request.Website,
            Industry = request.Industry,
            Location = request.Location,
            CompanyLogoUrl = request.CompanyLogoUrl
        };

        await _employerRepository.AddAsync(
            employer,
            cancellationToken);

        return MapToDto(employer, user.Email);
    }

    public async Task<EmployerProfileDto> UpdateProfileAsync(
        int userId,
        UpdateEmployerProfileDto request,
        CancellationToken cancellationToken = default)
    {
        var employer =
            await _employerRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (employer is null)
        {
            throw new InvalidOperationException(
                "Employer profile not found.");
        }

        var user =
            await _userRepository.GetByIdAsync(userId);

        if (user is null)
        {
            throw new InvalidOperationException(
                "User not found.");
        }

        employer.CompanyName = request.CompanyName;
        employer.CompanyDescription = request.CompanyDescription;
        employer.Website = request.Website;
        employer.Industry = request.Industry;
        employer.Location = request.Location;
        employer.CompanyLogoUrl = request.CompanyLogoUrl;

        await _employerRepository.UpdateAsync(
            employer,
            cancellationToken);

        return MapToDto(employer, user.Email);
    }

    private static EmployerProfileDto MapToDto(
        Employer employer,
        string email)
    {
        return new EmployerProfileDto
        {
            Id = employer.Id,
            UserId = employer.UserId,
            Email = email,
            CompanyName = employer.CompanyName,
            CompanyDescription = employer.CompanyDescription,
            Website = employer.Website,
            Industry = employer.Industry,
            Location = employer.Location,
            CompanyLogoUrl = employer.CompanyLogoUrl
        };
    }
}