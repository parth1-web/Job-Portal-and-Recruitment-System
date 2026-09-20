using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JobPortal.MVC.Models;
using JobPortal.MVC.Services;

namespace JobPortal.MVC.Controllers
{
    [Authorize(Policy = "CandidateOnly")]
    public class CandidateProfileController : Controller
    {
        private readonly ICandidateService _candidateService;
        private readonly ILogger<CandidateProfileController> _logger;

        public CandidateProfileController(
            ICandidateService candidateService,
            ILogger<CandidateProfileController> logger)
        {
            _candidateService = candidateService;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            try
            {
                var profile = await _candidateService.GetProfileAsync();
                var resumes = await _candidateService.GetResumesAsync();

                ViewData["Title"] = "My Profile";
                ViewData["PageTitle"] = "Candidate Profile";
                ViewData["UserRole"] = "Candidate";
                ViewData["Resumes"] = resumes;

                return View(profile ?? new CandidateProfileDto());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading candidate profile");
                return View(new CandidateProfileDto());
            }
        }

        public async Task<IActionResult> Create()
        {
            try
            {
                var skills = await _candidateService.GetSkillsAsync();
                
                ViewData["Title"] = "Create Profile";
                ViewData["PageTitle"] = "Create Your Profile";
                ViewData["UserRole"] = "Candidate";
                ViewData["Skills"] = skills;

                return View(new CandidateProfileDto());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading create profile page");
                return View(new CandidateProfileDto());
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CandidateProfileDto profile)
        {
            try
            {
                ViewData["Title"] = "Create Profile";
                ViewData["PageTitle"] = "Create Your Profile";
                ViewData["UserRole"] = "Candidate";

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Candidate profile model invalid: {Errors}",
                        string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => string.IsNullOrEmpty(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage)));
                    TempData["ErrorMessage"] = "Please correct the highlighted fields and try again.";
                    var skillsForView1 = await _candidateService.GetSkillsAsync();
                    ViewData["Skills"] = skillsForView1;
                    return View(profile);
                }

                var result = await _candidateService.UpdateProfileAsync(profile);
                if (result != null)
                {
                    TempData["SuccessMessage"] = "Profile created successfully!";
                    return RedirectToAction("Index");
                }

                TempData["ErrorMessage"] = "Failed to create profile.";
                var skillsForView2 = await _candidateService.GetSkillsAsync();
                ViewData["Skills"] = skillsForView2;
                return View(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating profile");
                TempData["ErrorMessage"] = "An error occurred while creating the profile.";
                return View(profile);
            }
        }

        public async Task<IActionResult> Edit()
        {
            try
            {
                var profile = await _candidateService.GetProfileAsync();
                var skills = await _candidateService.GetSkillsAsync();
                
                ViewData["Title"] = "Edit Profile";
                ViewData["PageTitle"] = "Edit Profile";
                ViewData["UserRole"] = "Candidate";
                ViewData["Skills"] = skills;

                return View(profile ?? new CandidateProfileDto());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading edit profile page");
                return View(new CandidateProfileDto());
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(CandidateProfileDto profile)
        {
            try
            {
                ViewData["Title"] = "Edit Profile";
                ViewData["PageTitle"] = "Edit Profile";
                ViewData["UserRole"] = "Candidate";

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Candidate profile model invalid: {Errors}",
                        string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => string.IsNullOrEmpty(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage)));
                    TempData["ErrorMessage"] = "Please correct the highlighted fields and try again.";
                    var skillsForView1 = await _candidateService.GetSkillsAsync();
                    ViewData["Skills"] = skillsForView1;
                    return View(profile);
                }

                var result = await _candidateService.UpdateProfileAsync(profile);
                if (result != null)
                {
                    TempData["SuccessMessage"] = "Profile updated successfully!";
                    return RedirectToAction("Index");
                }

                TempData["ErrorMessage"] = "Failed to update profile.";
                var skillsForView2 = await _candidateService.GetSkillsAsync();
                ViewData["Skills"] = skillsForView2;
                return View(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile");
                TempData["ErrorMessage"] = "An error occurred while updating the profile.";
                return View(profile);
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UploadResume(CreateResumeRequest request)
        {
            try
            {
                var result = await _candidateService.UploadResumeAsync(request);
                TempData[result ? "SuccessMessage" : "ErrorMessage"] =
                    result ? "Resume uploaded successfully." : "Failed to upload resume.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading resume");
                TempData["ErrorMessage"] = "An error occurred while uploading the resume.";
            }
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteResume(string resumeId)
        {
            try
            {
                var result = await _candidateService.DeleteResumeAsync(resumeId);
                TempData[result ? "SuccessMessage" : "ErrorMessage"] =
                    result ? "Resume deleted successfully." : "Failed to delete resume.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting resume {ResumeId}", resumeId);
                TempData["ErrorMessage"] = "An error occurred while deleting the resume.";
            }
            return RedirectToAction("Index");
        }
    }
}