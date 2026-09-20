using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using JobPortal.MVC.Models;
using JobPortal.MVC.Services;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace JobPortal.MVC.Controllers
{
    public class AuthController : Controller
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Login(string? returnUrl = null)
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                return RedirectToAction("Index", GetDashboardController());
            }

            ViewData["ReturnUrl"] = returnUrl;
            ViewData["Title"] = "Sign In";
            ViewData["PageTitle"] = "Welcome Back";
            return View(new LoginViewModel());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            ViewData["Title"] = "Sign In";
            ViewData["PageTitle"] = "Welcome Back";

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            try
            {
                var request = new LoginRequest
                {
                    Email = model.Email,
                    Password = model.Password,
                    RememberMe = model.RememberMe
                };

                var response = await _authService.LoginAsync(request);

                if (response != null)
                {
                    await SignInUserAsync(response, model.RememberMe);
                    TempData["SuccessMessage"] = "Welcome back!";

                    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }

                    return RedirectToAction("Index", response.Role == "Employer" ? "EmployerDashboard" : "CandidateDashboard");
                }

                ModelState.AddModelError("", "Invalid email or password.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed for {Email}", model.Email);
                ModelState.AddModelError("", "An error occurred during login. Please try again.");
            }

            return View(model);
        }

        [HttpGet]
        public IActionResult Register(string? returnUrl = null, string? role = null)
        {
            if (User.Identity?.IsAuthenticated == true)
            {
                return RedirectToAction("Index", GetDashboardController());
            }

            ViewData["ReturnUrl"] = returnUrl;
            ViewData["Title"] = "Create Account";
            ViewData["PageTitle"] = "Join JobPortal";

            var model = new RegisterViewModel();
            if (!string.IsNullOrWhiteSpace(role) &&
                (role.Equals("Employer", StringComparison.OrdinalIgnoreCase) ||
                 role.Equals("Candidate", StringComparison.OrdinalIgnoreCase)))
            {
                model.Role = char.ToUpper(role[0]) + role.Substring(1).ToLower();
            }

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model, string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            ViewData["Title"] = "Create Account";
            ViewData["PageTitle"] = "Join JobPortal";

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            if (model.Password != model.ConfirmPassword)
            {
                ModelState.AddModelError(nameof(model.ConfirmPassword), "Passwords do not match.");
                return View(model);
            }

            try
            {
                var request = new RegisterRequest
                {
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    Email = model.Email,
                    Password = model.Password,
                    ConfirmPassword = model.ConfirmPassword,
                    Role = model.Role,
                    PhoneNumber = model.PhoneNumber
                };

                var response = await _authService.RegisterAsync(request);

                if (response != null)
                {
                    await SignInUserAsync(response, isPersistent: false);
                    TempData["SuccessMessage"] = "Account created successfully! Welcome to JobPortal.";

                    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }

                    return RedirectToAction("Index", response.Role == "Employer" ? "EmployerDashboard" : "CandidateDashboard");
                }

                ModelState.AddModelError("", "Registration failed. Please try again.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration failed for {Email}", model.Email);
                ModelState.AddModelError("", "An error occurred during registration. Please try again.");
            }

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync();
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            TempData["SuccessMessage"] = "You have been signed out successfully.";
            return RedirectToAction("Index", "Home");
        }

        [HttpGet]
        public IActionResult AccessDenied()
        {
            ViewData["Title"] = "Access Denied";
            return View();
        }

        [HttpGet]
        public IActionResult ForgotPassword()
        {
            ViewData["Title"] = "Forgot Password";
            ViewData["PageTitle"] = "Reset Password";
            return View(new ForgotPasswordViewModel());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            ViewData["Title"] = "Forgot Password";
            ViewData["PageTitle"] = "Reset Password";

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            TempData["SuccessMessage"] = "If an account exists with that email, you will receive password reset instructions.";
            return RedirectToAction("Login");
        }

        private string GetDashboardController()
        {
            var role = User.FindFirst("role")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            return role == "Employer" ? "EmployerDashboard" : "CandidateDashboard";
        }

        private async Task SignInUserAsync(AuthResponse response, bool isPersistent)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, response.UserId),
                new(ClaimTypes.Name, response.FullName),
                new(ClaimTypes.Email, response.Email),
                new(ClaimTypes.Role, response.Role),
                new("role", response.Role)
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity),
                new AuthenticationProperties
                {
                    IsPersistent = isPersistent,
                    ExpiresUtc = response.ExpiresAt == default
                        ? DateTimeOffset.UtcNow.AddHours(8)
                        : new DateTimeOffset(response.ExpiresAt)
                });
        }
    }

    public class LoginViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; } = "";

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = "";

        [Display(Name = "Remember me")]
        public bool RememberMe { get; set; }
    }

    public class RegisterViewModel
    {
        [Required]
        [Display(Name = "First Name")]
        [StringLength(50, MinimumLength = 2)]
        public string FirstName { get; set; } = "";

        [Required]
        [Display(Name = "Last Name")]
        [StringLength(50, MinimumLength = 2)]
        public string LastName { get; set; } = "";

        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; } = "";

        [Required]
        [StringLength(100, MinimumLength = 8)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = "";

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Confirm Password")]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = "";

        [Required]
        [Display(Name = "I am a")]
        public string Role { get; set; } = "Candidate";

        [Phone]
        [Display(Name = "Phone Number (Optional)")]
        public string? PhoneNumber { get; set; }
    }

    public class ForgotPasswordViewModel
    {
        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; } = "";
    }
}