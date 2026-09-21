using JobPortal.Application.DTOs.Candidates;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Services;

public class CandidateService : ICandidateService
{
    private readonly ICandidateRepository _candidateRepository;
    private readonly IUserRepository _userRepository;

    public CandidateService(
        ICandidateRepository candidateRepository,
        IUserRepository userRepository)
    {
        _candidateRepository = candidateRepository;
        _userRepository = userRepository;
    }

    public async Task<CandidateProfileDto?> GetProfileAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var candidate =
            await _candidateRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (candidate is null)
        {
            return null;
        }

        var user =
    await _userRepository.GetByIdAsync(userId);

        if (user is null)
        {
            return null;
        }

        return MapToDto(candidate, user.Email);
    }

    public async Task<CandidateProfileDto> CreateProfileAsync(
        int userId,
        UpdateCandidateProfileDto request,
        CancellationToken cancellationToken = default)
    {
        var existing =
            await _candidateRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (existing is not null)
        {
            throw new InvalidOperationException(
                "Candidate profile already exists.");
        }

        var user =
     await _userRepository.GetByIdAsync(userId);

        if (user is null)
        {
            throw new InvalidOperationException(
                "User not found.");
        }

        var candidate = new Candidate
        {
            UserId = userId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Location = request.Location,
            ProfessionalTitle = request.ProfessionalTitle,
            Bio = request.Bio,
            ResumeUrl = request.ResumeUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _candidateRepository.AddAsync(
            candidate,
            cancellationToken);

        return MapToDto(candidate, user.Email);
    }

    public async Task<CandidateProfileDto> UpdateProfileAsync(
        int userId,
        UpdateCandidateProfileDto request,
        CancellationToken cancellationToken = default)
    {
        var candidate =
            await _candidateRepository.GetByUserIdAsync(
                userId,
                cancellationToken);

        if (candidate is null)
        {
            throw new InvalidOperationException(
                "Candidate profile not found.");
        }

        var user =
    await _userRepository.GetByIdAsync(userId);

        if (user is null)
        {
            throw new InvalidOperationException(
                "User not found.");
        }

        candidate.FirstName = request.FirstName;
        candidate.LastName = request.LastName;
        candidate.PhoneNumber = request.PhoneNumber;
        candidate.Location = request.Location;
        candidate.ProfessionalTitle = request.ProfessionalTitle;
        candidate.Bio = request.Bio;
        candidate.ResumeUrl = request.ResumeUrl;

        await _candidateRepository.UpdateAsync(
            candidate,
            cancellationToken);

        return MapToDto(candidate, user.Email);
    }

    private static CandidateProfileDto MapToDto(
        Candidate candidate,
        string email)
    {
        return new CandidateProfileDto
        {
            Id = candidate.Id,
            UserId = candidate.UserId,
            Email = email,
            FirstName = candidate.FirstName,
            LastName = candidate.LastName,
            PhoneNumber = candidate.PhoneNumber,
            Location = candidate.Location,
            ProfessionalTitle = candidate.ProfessionalTitle,
            Bio = candidate.Bio,
            ResumeUrl = candidate.ResumeUrl
        };
    }
}