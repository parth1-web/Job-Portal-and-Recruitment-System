using JobPortal.Application.Configuration;
using JobPortal.Application.DTOs.Auth;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using Microsoft.Extensions.Options;

namespace JobPortal.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
     IUserRepository userRepository,
     IPasswordHasher passwordHasher,
     IJwtService jwtService,
     IOptions<JwtSettings> jwtSettings)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResponseDto> RegisterAsync(
        RegisterRequestDto request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ArgumentException("Password is required.");
        }

        if (await _userRepository.EmailExistsAsync(email))
        {
            throw new InvalidOperationException(
                "A user with this email already exists.");
        }

        var requestedRole = request.Role.Trim();

        if (string.Equals(
                requestedRole,
                "Admin",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Admin registration is not allowed.");
        }

        string roleName;

        if (string.Equals(
                requestedRole,
                "Candidate",
                StringComparison.OrdinalIgnoreCase))
        {
            roleName = "Candidate";
        }
        else if (string.Equals(
                     requestedRole,
                     "Employer",
                     StringComparison.OrdinalIgnoreCase))
        {
            roleName = "Employer";
        }
        else
        {
            throw new ArgumentException(
                "Role must be Candidate or Employer.");
        }

        var role = await _userRepository.GetRoleByNameAsync(roleName);

        if (role is null)
        {
            throw new InvalidOperationException(
                $"Role '{roleName}' was not found.");
        }

        var user = new User
        {
            Email = email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            RoleId = role.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        user.Role = role;

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(
        LoginRequestDto request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ArgumentException("Password is required.");
        }

        var user = await _userRepository.GetByEmailWithProfileAsync(email);

        if (user is null)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException(
                "This account is inactive.");
        }

        var passwordValid = _passwordHasher.VerifyPassword(
            request.Password,
            user.PasswordHash);

        if (!passwordValid)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponseDto?> GetProfileAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user is null)
        {
            return null;
        }

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponseDto?> UpdateProfileAsync(
        int userId,
        UpdateProfileRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user is null)
        {
            return null;
        }

        if (user.Candidate != null)
        {
            user.Candidate.FirstName = request.FirstName;
            user.Candidate.LastName = request.LastName;
            user.Candidate.PhoneNumber = request.PhoneNumber;
        }
        else if (user.Employer != null)
        {
            user.Employer.CompanyName = request.FirstName; // Using FirstName as company name for employers
            user.Employer.CompanyLogoUrl = request.ProfileImageUrl;
        }

        user.Email = request.Email;
        
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return CreateAuthResponse(user);
    }

    public async Task<bool> ChangePasswordAsync(
        int userId,
        ChangePasswordRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (request.NewPassword != request.ConfirmNewPassword)
        {
            throw new ArgumentException("New passwords do not match.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user is null)
        {
            throw new UnauthorizedAccessException("User not found.");
        }

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new ArgumentException("Current password is incorrect.");
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return true;
    }

    private AuthResponseDto CreateAuthResponse(User user)
    {
        var token = _jwtService.GenerateToken(user);
        
        string fullName = "";
        string? phoneNumber = null;
        string? profileImageUrl = null;

        if (user.Candidate != null)
        {
            fullName = $"{user.Candidate.FirstName} {user.Candidate.LastName}".Trim();
            phoneNumber = user.Candidate.PhoneNumber;
        }
        else if (user.Employer != null)
        {
            fullName = user.Employer.CompanyName;
            profileImageUrl = user.Employer.CompanyLogoUrl;
        }

        if (string.IsNullOrWhiteSpace(fullName))
        {
            fullName = user.Email.Split('@')[0];
        }

        return new AuthResponseDto
        {
            Token = token,
            RefreshToken = "",
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            UserId = user.Id.ToString(),
            Email = user.Email,
            Role = user.Role.Name,
            FullName = fullName,
            PhoneNumber = phoneNumber,
            ProfileImageUrl = profileImageUrl
        };
    }
}