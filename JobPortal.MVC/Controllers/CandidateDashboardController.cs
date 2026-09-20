using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JobPortal.MVC.Services;
using JobPortal.MVC.Models;

namespace JobPortal.MVC.Controllers
{
    [Authorize(Policy = "CandidateOnly")]
    public class CandidateDashboardController : Controller
    {
        private readonly ICandidateService _candidateService;
        private readonly IJobService _jobService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<CandidateDashboardController> _logger;

        public CandidateDashboardController(
            ICandidateService candidateService,
            IJobService jobService,
            INotificationService notificationService,
            ILogger<CandidateDashboardController> logger)
        {
            _candidateService = candidateService;
            _jobService = jobService;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            try
            {
                var stats = await _candidateService.GetDashboardStatsAsync();
                var recentJobs = await _jobService.GetJobsAsync(new JobFilterRequest
                {
                    Page = 1,
                    PageSize = 5,
                    Status = "Published",
                    SortBy = "PostedDate",
                    SortDirection = "desc"
                });
                var recentApplications = await _candidateService.GetApplicationsAsync(1, 5);

                ViewData["Title"] = "Dashboard";
                ViewData["PageTitle"] = "Dashboard";
                ViewData["UserRole"] = "Candidate";

                var viewModel = new CandidateDashboardViewModel
                {
                    Stats = stats,
                    RecentJobs = recentJobs?.Items ?? new(),
                    RecentApplications = recentApplications?.Items ?? new()
                };

                return View(viewModel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading candidate dashboard");
                return View(new CandidateDashboardViewModel());
            }
        }

        public async Task<IActionResult> Applications(int page = 1, string? status = null)
        {
            try
            {
                var applications = await _candidateService.GetApplicationsAsync(page, 10);
                
                ViewData["Title"] = "My Applications";
                ViewData["PageTitle"] = "My Applications";
                ViewData["UserRole"] = "Candidate";
                ViewData["CurrentPage"] = page;
                ViewData["StatusFilter"] = status;

                return View(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading applications");
                return View(new PagedResult<JobApplicationDto>());
            }
        }

        public async Task<IActionResult> SavedJobs(int page = 1)
        {
            try
            {
                var savedJobs = await _candidateService.GetSavedJobsAsync(page, 10);
                
                ViewData["Title"] = "Saved Jobs";
                ViewData["PageTitle"] = "Saved Jobs";
                ViewData["UserRole"] = "Candidate";
                ViewData["CurrentPage"] = page;

                return View(savedJobs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading saved jobs");
                return View(new PagedResult<JobListDto>());
            }
        }

        public async Task<IActionResult> Interviews(int page = 1)
        {
            try
            {
                var interviews = await _candidateService.GetInterviewsAsync(page, 10);
                
                ViewData["Title"] = "Interviews";
                ViewData["PageTitle"] = "My Interviews";
                ViewData["UserRole"] = "Candidate";
                ViewData["CurrentPage"] = page;

                return View(interviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading interviews");
                return View(new PagedResult<InterviewDto>());
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveJob(string jobId)
        {
            try
            {
                var result = await _jobService.SaveJobAsync(jobId);
                if (result)
                {
                    return Json(new { success = true, message = "Job saved successfully" });
                }
                return Json(new { success = false, message = "Failed to save job" });
            }
            catch (ApiException ex) when (ex.StatusCode == 401)
            {
                return Unauthorized();
            }
            catch (ApiException ex)
            {
                return Json(CandidateFriendlyError(ex, "Failed to save job"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving job {JobId}", jobId);
                return Json(new { success = false, message = "An error occurred" });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UnsaveJob(string jobId)
        {
            try
            {
                var result = await _jobService.UnsaveJobAsync(jobId);
                if (result)
                {
                    return Json(new { success = true, message = "Job removed from saved" });
                }
                return Json(new { success = false, message = "Failed to remove job" });
            }
            catch (ApiException ex) when (ex.StatusCode == 401)
            {
                return Unauthorized();
            }
            catch (ApiException ex)
            {
                return Json(CandidateFriendlyError(ex, "Failed to remove job"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unsaving job {JobId}", jobId);
                return Json(new { success = false, message = "An error occurred" });
            }
        }

        private static object CandidateFriendlyError(ApiException ex, string fallback)
        {
            var message = ex.GetServerMessage() ?? fallback;
            if (message.Contains("Candidate profile", StringComparison.OrdinalIgnoreCase))
            {
                return new
                {
                    success = false,
                    message = "Please complete your candidate profile first.",
                    redirectUrl = "/CandidateProfile/Create"
                };
            }
            return new { success = false, message };
        }
    }

    public class CandidateDashboardViewModel
    {
        public DashboardStatsDto? Stats { get; set; }
        public List<JobListDto> RecentJobs { get; set; } = new();
        public List<JobApplicationDto> RecentApplications { get; set; } = new();
    }
}