using Microsoft.AspNetCore.Mvc;
using JobPortal.MVC.Services;

namespace JobPortal.MVC.Controllers
{
    public class HomeController : Controller
    {
        private readonly IJobService _jobService;
        private readonly ILogger<HomeController> _logger;

        public HomeController(IJobService jobService, ILogger<HomeController> logger)
        {
            _jobService = jobService;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            JobPortal.MVC.Models.PagedResult<JobPortal.MVC.Models.JobListDto>? jobs = null;

            try
            {
                var filter = new JobPortal.MVC.Models.JobFilterRequest
                {
                    Page = 1,
                    PageSize = 6,
                    Status = "Published",
                    SortBy = "PostedDate",
                    SortDirection = "desc"
                };

                jobs = await _jobService.GetJobsAsync(filter);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Job API unavailable ({BaseUrl}); rendering home page with empty job list.", HttpContext.RequestServices.GetService<Microsoft.Extensions.Configuration.IConfiguration>()?["ApiSettings:BaseUrl"]);
            }

            ViewData["Title"] = "Find Your Dream Job";
            ViewData["Description"] = "JobPortal - Connect with top employers and find your perfect career opportunity";

            return View(jobs ?? new JobPortal.MVC.Models.PagedResult<JobPortal.MVC.Models.JobListDto>());
        }

        public IActionResult Privacy()
        {
            ViewData["Title"] = "Privacy Policy";
            return View();
        }

        public IActionResult Terms()
        {
            ViewData["Title"] = "Terms of Service";
            return View();
        }

        public IActionResult About()
        {
            ViewData["Title"] = "About Us";
            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Title"] = "Contact Us";
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Contact(string firstName, string lastName, string email, string subject, string message)
        {
            ViewData["Title"] = "Contact Us";
            if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(message))
            {
                TempData["ErrorMessage"] = "Please fill in all required fields.";
                return View();
            }

            _logger.LogInformation("Contact message from {Email} about {Subject}", email, subject);
            TempData["SuccessMessage"] = "Thank you! Your message has been sent. We'll get back to you soon.";
            return RedirectToAction("Contact");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View("Error");
        }
    }
}