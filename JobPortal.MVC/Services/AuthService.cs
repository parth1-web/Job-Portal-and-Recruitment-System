using JobPortal.MVC.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace JobPortal.MVC.Services
{
    public class AuthService : IAuthService
    {
        private readonly IApiService _apiService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuthService> _logger;
        private const string UserSessionKey = "CurrentUser";

        public AuthService(IApiService apiService, IHttpContextAccessor httpContextAccessor, ILogger<AuthService> logger)
        {
            _apiService = apiService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public bool IsAuthenticated => !string.IsNullOrEmpty(GetTokenFromSession());

        public string? CurrentUserRole => GetUserFromSession()?.Role;
        public string? CurrentUserId => GetUserFromSession()?.Id;
        public string? CurrentUserName => GetUserFromSession()?.FullName;
        public string? CurrentUserEmail => GetUserFromSession()?.Email;

        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            try
            {
                var response = await _apiService.PostAsync<LoginRequest, AuthResponse>("api/auth/login", request);
                
                if (response != null && !string.IsNullOrEmpty(response.Token))
                {
                    _apiService.SetAuthToken(response.Token);
                    SaveUserToSession(response.ToUserProfile());
                    _logger.LogInformation("User {Email} logged in successfully", request.Email);
                    return response;
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed for {Email}", request.Email);
                throw;
            }
        }

        public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
        {
            try
            {
                var response = await _apiService.PostAsync<RegisterRequest, AuthResponse>("api/auth/register", request);
                
                if (response != null && !string.IsNullOrEmpty(response.Token))
                {
                    _apiService.SetAuthToken(response.Token);
                    SaveUserToSession(response.ToUserProfile());
                    _logger.LogInformation("User {Email} registered successfully", request.Email);
                    return response;
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration failed for {Email}", request.Email);
                throw;
            }
        }

        public async Task<bool> LogoutAsync()
        {
            try
            {
                await _apiService.PostAsync<object, object>("api/auth/logout", new { });
            }
            catch
            {
            }
            finally
            {
                _apiService.ClearAuthToken();
                ClearUserFromSession();
                _logger.LogInformation("User logged out");
            }
            return true;
        }

        public async Task<UserProfile?> GetProfileAsync()
        {
            try
            {
                var profile = await _apiService.GetAsync<UserProfile>("api/auth/profile");
                if (profile != null)
                {
                    var user = GetUserFromSession();
                    if (user != null)
                    {
                        user.FullName = profile.FullName;
                        user.Email = profile.Email;
                        user.PhoneNumber = profile.PhoneNumber;
                        user.ProfileImageUrl = profile.ProfileImageUrl;
                        SaveUserToSession(profile);
                    }
                }
                return profile;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get profile");
                throw;
            }
        }

        public async Task<UserProfile?> UpdateProfileAsync(UpdateProfileRequest request)
        {
            try
            {
                var profile = await _apiService.PutAsync<UpdateProfileRequest, UserProfile>("api/auth/profile", request);
                if (profile != null)
                {
                    var user = GetUserFromSession();
                    if (user != null)
                    {
                        user.FullName = profile.FullName;
                        user.Email = profile.Email;
                        user.PhoneNumber = profile.PhoneNumber;
                        user.ProfileImageUrl = profile.ProfileImageUrl;
                        SaveUserToSession(profile);
                    }
                }
                return profile;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update profile");
                throw;
            }
        }

        public async Task<bool> ChangePasswordAsync(ChangePasswordRequest request)
        {
            try
            {
                await _apiService.PostAsync<ChangePasswordRequest, object>("api/auth/change-password", request);
                _logger.LogInformation("Password changed successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to change password");
                throw;
            }
        }

        private string? GetTokenFromSession()
        {
            var context = _httpContextAccessor.HttpContext;
            return context?.Session?.GetString("AuthToken");
        }

        private UserSession? GetUserFromSession()
        {
            var context = _httpContextAccessor.HttpContext;
            var json = context?.Session?.GetString(UserSessionKey);
            if (string.IsNullOrEmpty(json)) return null;
            
            try
            {
                return JsonSerializer.Deserialize<UserSession>(json);
            }
            catch
            {
                return null;
            }
        }

        private void SaveUserToSession(UserProfile user)
        {
            var context = _httpContextAccessor.HttpContext;
            var session = new UserSession
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                PhoneNumber = user.PhoneNumber,
                ProfileImageUrl = user.ProfileImageUrl
            };
            context?.Session?.SetString(UserSessionKey, JsonSerializer.Serialize(session));
        }

        private void ClearUserFromSession()
        {
            var context = _httpContextAccessor.HttpContext;
            context?.Session?.Remove(UserSessionKey);
        }

        private class UserSession
        {
            public string Id { get; set; } = "";
            public string Email { get; set; } = "";
            public string FullName { get; set; } = "";
            public string Role { get; set; } = "";
            public string? PhoneNumber { get; set; }
            public string? ProfileImageUrl { get; set; }
        }
    }
}