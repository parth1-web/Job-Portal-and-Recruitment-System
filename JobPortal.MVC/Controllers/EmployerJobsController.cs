using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JobPortal.MVC.Models;
using JobPortal.MVC.Services;

namespace JobPortal.MVC.Controllers
{
    [Authorize(Policy = "EmployerOnly")]
    public class EmployerJobsController : Controller
    {
        private readonly IJobService _jobService;
        private readonly IEmployerService _employerService;
        private readonly ILogger<EmployerJobsController> _logger;

        public EmployerJobsController(
            IJobService jobService,
            IEmployerService employerService,
            ILogger<EmployerJobsController> logger)
        {
            _jobService = jobService;
            _employerService = employerService;
            _logger = logger;
        }

        public async Task<IActionResult> Create()
        {
            try
            {
                var skills = await _jobService.GetSkillsAsync();
                var categories = await _jobService.GetJobCategoriesAsync();
                var profile = await _employerService.GetProfileAsync();

                ViewData["Title"] = "Post a Job";
                ViewData["PageTitle"] = "Post a New Job";
                ViewData["UserRole"] = "Employer";
                ViewData["Skills"] = skills;
                ViewData["Categories"] = categories;
                ViewData["CompanyId"] = profile?.Id;

                return View(new CreateJobRequest());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading create job page");
                return View(new CreateJobRequest());
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CreateJobRequest request)
        {
            try
            {
if (!ModelState.IsValid)
            {
                var skillsForView1 = await _jobService.GetSkillsAsync();
                var categoriesForView1 = await _jobService.GetJobCategoriesAsync();
                var profile = await _employerService.GetProfileAsync();

                ViewData["Skills"] = skillsForView1;
                ViewData["Categories"] = categoriesForView1;
                ViewData["CompanyId"] = profile?.Id;
                return View(request);
            }

            var result = await _jobService.CreateJobAsync(request);
            if (result != null)
            {
                TempData["SuccessMessage"] = "Job posted successfully!";
                return RedirectToAction("Details", new { id = result.Id });
            }

            TempData["ErrorMessage"] = "Failed to create job.";
            var skillsForView2 = await _jobService.GetSkillsAsync();
            var categoriesForView2 = await _jobService.GetJobCategoriesAsync();
            ViewData["Skills"] = skillsForView2;
            ViewData["Categories"] = categoriesForView2;
            return View(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating job");
                TempData["ErrorMessage"] = "An error occurred while creating the job.";
                return View(request);
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
                ViewData["UserRole"] = "Employer";

                return View(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading job {JobId}", id);
                return NotFound();
            }
        }

        public async Task<IActionResult> Edit(string id)
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

                var skills = await _jobService.GetSkillsAsync();
                var categories = await _jobService.GetJobCategoriesAsync();

                ViewData["Title"] = "Edit Job";
                ViewData["PageTitle"] = "Edit Job";
                ViewData["UserRole"] = "Employer";
                ViewData["Skills"] = skills;
                ViewData["Categories"] = categories;

                var updateRequest = new UpdateJobRequest
                {
                    Title = job.Title,
                    Description = job.Description,
                    Requirements = job.Requirements,
                    Benefits = job.Benefits,
                    Location = job.Location,
                    WorkMode = job.WorkMode,
                    EmploymentType = job.EmploymentType,
                    MinSalary = job.MinSalary,
                    MaxSalary = job.MaxSalary,
                    Currency = job.Currency,
                    Responsibilities = string.Join("\n", job.Responsibilities),
                    PreferredQualifications = string.Join("\n", job.PreferredQualifications),
                    ExpiryDate = job.ExpiryDate,
                    SkillIds = job.Skills.Select(s => s).ToList(),
                    Status = job.Status,
                    CategoryId = job.CategoryId
                };

                return View(updateRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading edit job page {JobId}", id);
                return NotFound();
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(string id, UpdateJobRequest request)
        {
            try
            {
if (!ModelState.IsValid)
            {
                var skillsForView1 = await _jobService.GetSkillsAsync();
                var categoriesForView1 = await _jobService.GetJobCategoriesAsync();
                ViewData["Skills"] = skillsForView1;
                ViewData["Categories"] = categoriesForView1;
                return View(request);
            }

            var result = await _jobService.UpdateJobAsync(id, request);
            if (result != null)
            {
                TempData["SuccessMessage"] = "Job updated successfully!";
                return RedirectToAction("Details", new { id });
            }

            TempData["ErrorMessage"] = "Failed to update job.";
            var skillsForView2 = await _jobService.GetSkillsAsync();
            var categoriesForView2 = await _jobService.GetJobCategoriesAsync();
            ViewData["Skills"] = skillsForView2;
            ViewData["Categories"] = categoriesForView2;
            return View(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating job {JobId}", id);
                TempData["ErrorMessage"] = "An error occurred while updating the job.";
                return View(request);
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var result = await _jobService.DeleteJobAsync(id);
                if (result)
                {
                    TempData["SuccessMessage"] = "Job deleted successfully!";
                    return RedirectToAction("Jobs", "EmployerDashboard");
                }

                TempData["ErrorMessage"] = "Failed to delete job.";
                return RedirectToAction("Details", new { id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting job {JobId}", id);
                TempData["ErrorMessage"] = "An error occurred while deleting the job.";
                return RedirectToAction("Details", new { id });
            }
        }
    }
}