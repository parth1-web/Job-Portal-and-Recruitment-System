using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JobPortal.MVC.Services;
using JobPortal.MVC.Models;

namespace JobPortal.MVC.Controllers
{
    [Authorize(Policy = "EmployerOnly")]
    public class EmployerDashboardController : Controller
    {
        private readonly IEmployerService _employerService;
        private readonly IJobService _jobService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<EmployerDashboardController> _logger;

        public EmployerDashboardController(
            IEmployerService employerService,
            IJobService jobService,
            INotificationService notificationService,
            ILogger<EmployerDashboardController> logger)
        {
            _employerService = employerService;
            _jobService = jobService;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            try
            {
                var stats = await _employerService.GetDashboardStatsAsync();
                var myJobs = await _employerService.GetMyJobsAsync(1, 5);
                var recentApplications = await _employerService.GetApplicationsAsync(null, 1, 5);
                var upcomingInterviews = await _employerService.GetInterviewsAsync(1, 5);

                ViewData["Title"] = "Employer Dashboard";
                ViewData["PageTitle"] = "Dashboard";
                ViewData["UserRole"] = "Employer";

                var viewModel = new EmployerDashboardViewModel
                {
                    Stats = stats,
                    MyJobs = myJobs?.Items ?? new(),
                    RecentApplications = recentApplications?.Items ?? new(),
                    UpcomingInterviews = upcomingInterviews?.Items ?? new()
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading employer dashboard");
                return View(new EmployerDashboardViewModel());
            }
        }

        public async Task<IActionResult> Jobs(int page = 1, string? status = null)
        {
            try
            {
                var jobs = await _employerService.GetMyJobsAsync(page, 10, status);
                
                ViewData["Title"] = "My Jobs";
                ViewData["PageTitle"] = "My Jobs";
                ViewData["UserRole"] = "Employer";
                ViewData["CurrentPage"] = page;
                ViewData["StatusFilter"] = status;

                return View(jobs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading employer jobs");
                return View(new PagedResult<JobListDto>());
            }
        }

        public async Task<IActionResult> Applications(string? jobId, int page = 1, string? status = null)
        {
            try
            {
                var applications = await _employerService.GetApplicationsAsync(jobId, page, 10);
                
                ViewData["Title"] = jobId != null ? "Job Applications" : "All Applications";
                ViewData["PageTitle"] = jobId != null ? "Applications for this Job" : "All Applications";
                ViewData["UserRole"] = "Employer";
                ViewData["CurrentPage"] = page;
                ViewData["JobId"] = jobId;
                ViewData["StatusFilter"] = status;

                return View(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading applications");
                return View(new PagedResult<JobApplicationDto>());
            }
        }

        public async Task<IActionResult> Interviews(int page = 1)
        {
            try
            {
                var interviews = await _employerService.GetInterviewsAsync(page, 10);
                
                ViewData["Title"] = "Interviews";
                ViewData["PageTitle"] = "Interviews";
                ViewData["UserRole"] = "Employer";
                ViewData["CurrentPage"] = page;

                return View(interviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading interviews");
                return View(new PagedResult<InterviewDto>());
            }
        }

        public async Task<IActionResult> CompanyProfile()
        {
            try
            {
                var profile = await _employerService.GetProfileAsync();
                
                ViewData["Title"] = "Company Profile";
                ViewData["PageTitle"] = "Company Profile";
                ViewData["UserRole"] = "Employer";

                return View(profile ?? new EmployerProfileDto());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading company profile");
                return View(new EmployerProfileDto());
            }
        }

        public IActionResult UpdateStatus(string jobId, string applicationId)
        {
            if (string.IsNullOrEmpty(jobId) || string.IsNullOrEmpty(applicationId))
                return NotFound();

            ViewData["Title"] = "Review Application";
            ViewData["PageTitle"] = "Review Application";
            ViewData["UserRole"] = "Employer";
            ViewData["JobId"] = jobId;
            ViewData["ApplicationId"] = applicationId;

            return View(new UpdateApplicationStatusRequest { Status = "Reviewed" });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateStatus(string jobId, string applicationId, UpdateApplicationStatusRequest request)
        {
            if (string.IsNullOrEmpty(jobId) || string.IsNullOrEmpty(applicationId))
                return NotFound();

            try
            {
                var result = await _jobService.UpdateApplicationStatusAsync(jobId, applicationId, request);
                if (result != null)
                {
                    TempData["SuccessMessage"] = "Application status updated.";
                    return RedirectToAction("Applications", new { jobId });
                }
                TempData["ErrorMessage"] = "Failed to update application status.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating application {ApplicationId}", applicationId);
                TempData["ErrorMessage"] = "An error occurred while updating the status.";
            }

            ViewData["Title"] = "Review Application";
            ViewData["PageTitle"] = "Review Application";
            ViewData["UserRole"] = "Employer";
            ViewData["JobId"] = jobId;
            ViewData["ApplicationId"] = applicationId;
            return View(request);
        }

        public IActionResult ScheduleInterview(string jobId, string applicationId)
        {
            if (string.IsNullOrEmpty(jobId) || string.IsNullOrEmpty(applicationId))
                return NotFound();

            ViewData["Title"] = "Schedule Interview";
            ViewData["PageTitle"] = "Schedule Interview";
            ViewData["UserRole"] = "Employer";
            ViewData["JobId"] = jobId;

            return View(new CreateInterviewRequest
            {
                ApplicationId = applicationId,
                ScheduledAt = DateTime.Now.AddDays(2),
                DurationMinutes = 60
            });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ScheduleInterview(string jobId, CreateInterviewRequest request)
        {
            ViewData["Title"] = "Schedule Interview";
            ViewData["PageTitle"] = "Schedule Interview";
            ViewData["UserRole"] = "Employer";
            ViewData["JobId"] = jobId;

            if (!ModelState.IsValid)
                return View(request);

            try
            {
                var ok = await _employerService.CreateInterviewAsync(request);
                if (ok)
                {
                    TempData["SuccessMessage"] = "Interview scheduled.";
                    return RedirectToAction("Interviews");
                }
                TempData["ErrorMessage"] = "Failed to schedule the interview.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling interview for application {ApplicationId}", request.ApplicationId);
                TempData["ErrorMessage"] = "An error occurred while scheduling the interview.";
            }

            return View(request);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateCompanyProfile(EmployerProfileDto profile)
        {
            try
            {
                var result = await _employerService.UpdateProfileAsync(profile);
                if (result != null)
                {
                    TempData["SuccessMessage"] = "Company profile updated successfully!";
                    return RedirectToAction("CompanyProfile");
                }
                
                TempData["ErrorMessage"] = "Failed to update company profile.";
                return View("CompanyProfile", profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating company profile");
                TempData["ErrorMessage"] = "An error occurred while updating the profile.";
                return View("CompanyProfile", profile);
            }
        }
    }

    public class EmployerDashboardViewModel
    {
        public DashboardStatsDto? Stats { get; set; }
        public List<JobListDto> MyJobs { get; set; } = new();
        public List<JobApplicationDto> RecentApplications { get; set; } = new();
        public List<InterviewDto> UpcomingInterviews { get; set; } = new();
    }
}