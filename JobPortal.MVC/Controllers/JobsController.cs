using Microsoft.AspNetCore.Mvc;
using JobPortal.MVC.Services;
using JobPortal.MVC.Models;

namespace JobPortal.MVC.Controllers
{
    public class JobsController : Controller
    {
        private readonly IJobService _jobService;
        private readonly ILogger<JobsController> _logger;

        public JobsController(IJobService jobService, ILogger<JobsController> logger)
        {
            _jobService = jobService;
            _logger = logger;
        }

        public async Task<IActionResult> Index(JobFilterRequest filter)
        {
            try
            {
                filter.Page = filter.Page > 0 ? filter.Page : 1;
                filter.PageSize = filter.PageSize > 0 ? filter.PageSize : 10;
                
                if (string.IsNullOrEmpty(filter.Status))
                {
                    filter.Status = "Published";
                }

                var result = await _jobService.GetJobsAsync(filter);
                
                var categories = await _jobService.GetJobCategoriesAsync();
                var skills = await _jobService.GetSkillsAsync();

                ViewData["Title"] = "Browse Jobs";
                ViewData["PageTitle"] = "Browse Jobs";
                ViewData["Categories"] = categories;
                ViewData["Skills"] = skills;
                ViewData["Filter"] = filter;

                return View(result ?? new PagedResult<JobListDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading jobs");
                return View(new PagedResult<JobListDto>());
            }
        }

        public async Task<IActionResult> Details(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return NotFound();
            }

            try
            {
                var job = await _jobService.GetJobByIdAsync(id);
                
                if (job == null)
                {
                    return NotFound();
                }

                ViewData["Title"] = job.Title;
                ViewData["PageTitle"] = job.Title;
                ViewData["Description"] = job.Description.Length > 160 ? job.Description.Substring(0, 160) + "..." : job.Description;

                return View(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading job {JobId}", id);
                return NotFound();
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Save(string jobId)
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
                _logger.LogWarning(ex, "API rejected save job {JobId}", jobId);
                return Json(FriendlyError(ex, "Failed to save job"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving job {JobId}", jobId);
                return Json(new { success = false, message = "An error occurred" });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Unsave(string jobId)
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
                _logger.LogWarning(ex, "API rejected unsave job {JobId}", jobId);
                return Json(FriendlyError(ex, "Failed to remove job"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unsaving job {JobId}", jobId);
                return Json(new { success = false, message = "An error occurred" });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Apply(string jobId, CreateApplicationRequest request)
        {
            try
            {
                request.JobId = jobId;
                var result = await _jobService.ApplyToJobAsync(request);
                
                if (result != null)
                {
                    return Json(new { success = true, message = "Application submitted successfully!", applicationId = result.Id });
                }
                return Json(new { success = false, message = "Failed to submit application" });
            }
            catch (ApiException ex) when (ex.StatusCode == 401)
            {
                return Unauthorized();
            }
            catch (ApiException ex)
            {
                _logger.LogWarning(ex, "API rejected application for job {JobId}", jobId);
                return Json(FriendlyError(ex, "Failed to submit application"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying to job {JobId}", jobId);
                return Json(new { success = false, message = "An error occurred" });
            }
        }

        private static object FriendlyError(ApiException ex, string fallback)
        {
            var message = ex.GetServerMessage() ?? fallback;
            // First-time candidates must create their profile before the API
            // accepts saves/applications; send them straight there.
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
}