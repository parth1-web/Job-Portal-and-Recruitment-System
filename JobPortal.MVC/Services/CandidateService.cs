using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    public class CandidateService : ICandidateService
    {
        private readonly IApiService _apiService;

        public CandidateService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<CandidateProfileDto?> GetProfileAsync()
        {
            var profile = await _apiService.GetAsync<ApiCandidateProfileDto>("api/candidate/profile");
            return profile == null ? null : MapProfile(profile);
        }

        public async Task<CandidateProfileDto?> UpdateProfileAsync(CandidateProfileDto profile)
        {
            var names = (profile.FullName ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var apiRequest = new
            {
                FirstName = names.Length > 0 ? names[0] : "",
                LastName = names.Length > 1 ? string.Join(' ', names.Skip(1)) : "",
                PhoneNumber = profile.PhoneNumber,
                Location = profile.Location,
                ProfessionalTitle = profile.Headline,
                Bio = profile.Summary,
                ResumeUrl = profile.ResumeUrl
            };
            // Update existing profile; fall back to create for first-timers
            // (a 404 from PUT throws, so catch it before trying POST).
            try
            {
                var updated = await _apiService.PutAsync<object, ApiCandidateProfileDto>("api/candidate/profile", apiRequest);
                if (updated != null)
                    return MapProfile(updated);
            }
            catch (ApiException ex) when (ex.StatusCode == 404)
            {
                // No profile yet: create it below.
            }
            var created = await _apiService.PostAsync<object, ApiCandidateProfileDto>("api/candidate/profile", apiRequest);
            return created == null ? null : MapProfile(created);
        }

        public async Task<bool> UploadResumeAsync(CreateResumeRequest request)
        {
            var apiRequest = new { FileName = request.FileName, FileUrl = request.FileUrl, IsDefault = request.IsDefault };
            var result = await _apiService.PostAsync<object, ApiResumeDto>("api/candidate/resumes", apiRequest);
            return result != null;
        }

        public async Task<List<ResumeDto>> GetResumesAsync()
        {
            var items = await _apiService.GetAsync<List<ApiResumeDto>>("api/candidate/resumes") ?? new List<ApiResumeDto>();
            return items.Select(r => new ResumeDto
            {
                Id = r.Id.ToString(),
                FileName = r.FileName,
                FileUrl = r.FileUrl,
                IsDefault = r.IsDefault,
                UploadedAt = r.UploadedAt
            }).ToList();
        }

        public async Task<bool> DeleteResumeAsync(string resumeId)
        {
            if (!int.TryParse(resumeId, out var id))
                return false;
            return await _apiService.DeleteAsync($"api/candidate/resumes/{id}");
        }

        public async Task<PagedResult<JobApplicationDto>?> GetApplicationsAsync(int page = 1, int pageSize = 10)
        {
            var items = await _apiService.GetAsync<List<JobApplicationDto>>("api/candidate/applications")
                ?? new List<JobApplicationDto>();
            return JobService.ToPaged(items.OrderByDescending(a => a.AppliedAt).ToList(), page, pageSize);
        }

        public async Task<PagedResult<JobListDto>?> GetSavedJobsAsync(int page = 1, int pageSize = 10)
        {
            var items = await _apiService.GetAsync<List<ApiSavedJobDto>>("api/candidate/saved-jobs")
                ?? new List<ApiSavedJobDto>();
            var jobs = items.Select(s => new JobListDto
            {
                Id = s.JobId,
                Title = s.JobTitle,
                CompanyName = s.CompanyName,
                PostedDate = s.SavedAt,
                IsSaved = true
            }).ToList();
            return JobService.ToPaged(jobs, page, pageSize);
        }

        public async Task<PagedResult<InterviewDto>?> GetInterviewsAsync(int page = 1, int pageSize = 10)
        {
            // The API exposes interviews per application; aggregate across mine.
            var applications = await _apiService.GetAsync<List<JobApplicationDto>>("api/candidate/applications")
                ?? new List<JobApplicationDto>();
            var all = new List<InterviewDto>();
            foreach (var app in applications.Take(20))
            {
                var list = await _apiService.GetAsync<List<ApiInterviewDto>>($"api/interviews/application/{app.Id}") ?? new List<ApiInterviewDto>();
                all.AddRange(list.Select(ApiMaps.ToInterview));
            }
            return JobService.ToPaged(all.OrderBy(i => i.ScheduledAt).ToList(), page, pageSize);
        }

        public async Task<DashboardStatsDto?> GetDashboardStatsAsync()
        {
            var applications = await _apiService.GetAsync<List<JobApplicationDto>>("api/candidate/applications")
                ?? new List<JobApplicationDto>();
            var saved = await _apiService.GetAsync<List<ApiSavedJobDto>>("api/candidate/saved-jobs")
                ?? new List<ApiSavedJobDto>();
            var interviews = await GetInterviewsAsync(1, 100);

            return new DashboardStatsDto
            {
                TotalApplications = applications.Count,
                PendingApplications = applications.Count(a =>
                    a.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase) ||
                    a.Status.Equals("Applied", StringComparison.OrdinalIgnoreCase)),
                SavedJobs = saved.Count,
                InterviewsScheduled = interviews?.TotalCount ?? 0,
                ProfileViews = 0
            };
        }

        public async Task<List<SkillDto>> GetSkillsAsync()
        {
            var items = await _apiService.GetAsync<List<ApiSkillDto>>("api/skills") ?? new List<ApiSkillDto>();
            return items.Select(s => new SkillDto { Id = s.Id, Name = s.Name }).ToList();
        }

        internal static InterviewDto MapInterview(ApiInterviewDto i) => ApiMaps.ToInterview(i);

        private static CandidateProfileDto MapProfile(ApiCandidateProfileDto p) => new()
        {
            Id = p.Id.ToString(),
            UserId = p.UserId.ToString(),
            FullName = $"{p.FirstName} {p.LastName}".Trim(),
            Email = p.Email,
            PhoneNumber = p.PhoneNumber ?? "",
            Headline = p.ProfessionalTitle ?? "",
            Summary = p.Bio ?? "",
            Location = p.Location ?? "",
            ResumeUrl = p.ResumeUrl ?? ""
        };

        private sealed class ApiCandidateProfileDto
        {
            public int Id { get; set; }
            public int UserId { get; set; }
            public string Email { get; set; } = "";
            public string FirstName { get; set; } = "";
            public string LastName { get; set; } = "";
            public string? PhoneNumber { get; set; }
            public string? Location { get; set; }
            public string? ProfessionalTitle { get; set; }
            public string? Bio { get; set; }
            public string? ResumeUrl { get; set; }
        }

        private sealed class ApiResumeDto
        {
            public int Id { get; set; }
            public string FileName { get; set; } = "";
            public string FileUrl { get; set; } = "";
            public bool IsDefault { get; set; }
            public DateTime UploadedAt { get; set; }
        }

        private sealed class ApiSavedJobDto
        {
            public string JobId { get; set; } = "";
            public string JobTitle { get; set; } = "";
            public string CompanyName { get; set; } = "";
            public DateTime SavedAt { get; set; }
        }

        private sealed class ApiSkillDto
        {
            public string Id { get; set; } = "";
            public string Name { get; set; } = "";
        }
    }
}