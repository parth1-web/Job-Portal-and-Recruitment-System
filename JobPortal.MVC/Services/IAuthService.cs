using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> LoginAsync(LoginRequest request);
        Task<AuthResponse?> RegisterAsync(RegisterRequest request);
        Task<bool> LogoutAsync();
        Task<UserProfile?> GetProfileAsync();
        Task<UserProfile?> UpdateProfileAsync(UpdateProfileRequest request);
        Task<bool> ChangePasswordAsync(ChangePasswordRequest request);
        bool IsAuthenticated { get; }
        string? CurrentUserRole { get; }
        string? CurrentUserId { get; }
        string? CurrentUserName { get; }
        string? CurrentUserEmail { get; }
    }
}