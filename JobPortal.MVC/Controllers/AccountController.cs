using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JobPortal.MVC.Models;
using JobPortal.MVC.Services;

namespace JobPortal.MVC.Controllers
{
    [Authorize]
    public class AccountController : Controller
    {
        private readonly IAuthService _authService;
        private readonly ICandidateService _candidateService;
        private readonly IEmployerService _employerService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(
            IAuthService authService,
            ICandidateService candidateService,
            IEmployerService employerService,
            ILogger<AccountController> logger)
        {
            _authService = authService;
            _candidateService = candidateService;
            _employerService = employerService;
            _logger = logger;
        }

        public async Task<IActionResult> Profile()
        {
            try
            {
                var profile = await _authService.GetProfileAsync();
                
                ViewData["Title"] = "Profile";
                ViewData["PageTitle"] = "My Profile";
                ViewData["UserRole"] = User.FindFirst("role")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

                return View(profile ?? new UserProfile());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading profile");
                return View(new UserProfile());
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            try
            {
                var result = await _authService.UpdateProfileAsync(request);
                if (result != null)
                {
                    TempData["SuccessMessage"] = "Profile updated successfully!";
                    return RedirectToAction("Profile");
                }
                
                TempData["ErrorMessage"] = "Failed to update profile.";
                return View("Profile", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile");
                TempData["ErrorMessage"] = "An error occurred while updating the profile.";
                return View("Profile", new UserProfile());
            }
        }

        public async Task<IActionResult> Settings()
        {
            try
            {
                var profile = await _authService.GetProfileAsync();
                
                ViewData["Title"] = "Settings";
                ViewData["PageTitle"] = "Account Settings";
                ViewData["UserRole"] = User.FindFirst("role")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

                return View(profile ?? new UserProfile());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading settings");
                return View(new UserProfile());
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            try
            {
                if (request.NewPassword != request.ConfirmNewPassword)
                {
                    ModelState.AddModelError(nameof(request.ConfirmNewPassword), "Passwords do not match.");
                    return View("Settings", new UserProfile());
                }

                await _authService.ChangePasswordAsync(request);
                TempData["SuccessMessage"] = "Password changed successfully!";
                return RedirectToAction("Settings");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                TempData["ErrorMessage"] = "An error occurred while changing the password.";
                return View("Settings", new UserProfile());
            }
        }
    }
}