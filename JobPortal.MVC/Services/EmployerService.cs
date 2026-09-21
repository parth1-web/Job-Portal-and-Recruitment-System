using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    public class EmployerService : IEmployerService
    {
        private readonly IApiService _apiService;

        public EmployerService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<EmployerProfileDto?> GetProfileAsync()
        {
            var profile = await _apiService.GetAsync<ApiEmployerProfileDto>("api/employer/profile");
            return profile == null ? null : MapProfile(profile);
        }

        public async Task<EmployerProfileDto?> UpdateProfileAsync(EmployerProfileDto profile)
        {
            var apiRequest = new
            {
                CompanyName = profile.CompanyName,
                CompanyDescription = profile.Description,
                Website = profile.Website,
                Industry = profile.Industry,
                Location = profile.Location,
                CompanyLogoUrl = profile.CompanyLogoUrl
            };
            ApiEmployerProfileDto? updated = null;
            try
            {
                updated = await _apiService.PutAsync<object, ApiEmployerProfileDto>("api/employer/profile", apiRequest);
            }
            catch (ApiException ex) when (ex.StatusCode == 404)
            {
                // No profile yet: create it below.
            }
            updated ??= await _apiService.PostAsync<object, ApiEmployerProfileDto>("api/employer/profile", apiRequest);
            return updated == null ? null : MapProfile(updated);
        }

        public async Task<PagedResult<JobListDto>?> GetMyJobsAsync(int page = 1, int pageSize = 10, string? status = null)
        {
            // The API returns a plain list; filter and page it client-side.
            var items = await _apiService.GetAsync<List<JobListDto>>("api/employer/jobs")
                ?? new List<JobListDto>();
            if (!string.IsNullOrEmpty(status))
                items = items.Where(j => j.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
            items = items.OrderByDescending(j => j.PostedDate).ToList();
            return JobService.ToPaged(items, page, pageSize);
        }

        public async Task<PagedResult<JobApplicationDto>?> GetApplicationsAsync(string? jobId = null, int page = 1, int pageSize = 10)
        {
            var all = new List<JobApplicationDto>();
            if (!string.IsNullOrEmpty(jobId))
            {
                var items = await _apiService.GetAsync<List<JobApplicationDto>>($"api/employer/jobs/{jobId}/applications")
                    ?? new List<JobApplicationDto>();
                all.AddRange(items);
            }
            else
            {
                // No employer-wide endpoint exists; aggregate across my jobs.
                var jobs = await _apiService.GetAsync<List<JobListDto>>("api/employer/jobs")
                    ?? new List<JobListDto>();
                foreach (var job in jobs.Take(50))
                {
                    try
                    {
                        var items = await _apiService.GetAsync<List<JobApplicationDto>>($"api/employer/jobs/{job.Id}/applications")
                            ?? new List<JobApplicationDto>();
                        all.AddRange(items);
                    }
                    catch
                    {
                        // Skip jobs that fail individually; still show the rest.
                    }
                }
            }
            return JobService.ToPaged(all.OrderByDescending(a => a.AppliedAt).ToList(), page, pageSize);
        }

        public async Task<PagedResult<InterviewDto>?> GetInterviewsAsync(int page = 1, int pageSize = 10)
        {
            // Aggregate interviews across my jobs' applications.
            var jobs = await _apiService.GetAsync<List<JobListDto>>("api/employer/jobs")
                ?? new List<JobListDto>();
            var all = new List<InterviewDto>();
            foreach (var job in jobs.Take(20))
            {
                List<JobApplicationDto>? apps = null;
                try
                {
                    apps = await _apiService.GetAsync<List<JobApplicationDto>>($"api/employer/jobs/{job.Id}/applications");
                }
                catch
                {
                    continue;
                }
                foreach (var app in (apps ?? new List<JobApplicationDto>()).Take(20))
                {
                    try
                    {
                        var list = await _apiService.GetAsync<List<ApiInterviewDto>>($"api/interviews/application/{app.Id}") ?? new List<ApiInterviewDto>();
                        all.AddRange(list.Select(ApiMaps.ToInterview));
                    }
                    catch
                    {
                        // Skip applications that fail individually.
                    }
                }
            }
            return JobService.ToPaged(all.OrderBy(i => i.ScheduledAt).ToList(), page, pageSize);
        }

        public async Task<DashboardStatsDto?> GetDashboardStatsAsync()
        {
            var jobs = await _apiService.GetAsync<List<JobListDto>>("api/employer/jobs")
                ?? new List<JobListDto>();
            var apps = await GetApplicationsAsync(null, 1, int.MaxValue);
            var interviews = await GetInterviewsAsync(1, 100);
            var appItems = apps?.Items ?? new List<JobApplicationDto>();

            return new DashboardStatsDto
            {
                TotalJobs = jobs.Count,
                ActiveJobs = jobs.Count(j => j.Status.Equals("Published", StringComparison.OrdinalIgnoreCase)),
                TotalApplications = appItems.Count,
                PendingApplications = appItems.Count(a =>
                    a.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase) ||
                    a.Status.Equals("Applied", StringComparison.OrdinalIgnoreCase)),
                InterviewsScheduled = interviews?.TotalCount ?? 0
            };
        }

        public async Task<bool> CreateInterviewAsync(CreateInterviewRequest request)
        {
            if (!int.TryParse(request.ApplicationId, out var applicationId))
                return false;
            var apiRequest = new
            {
                ApplicationId = applicationId,
                request.ScheduledAt,
                request.DurationMinutes,
                request.MeetingLink,
                request.Notes
            };
            var result = await _apiService.PostAsync<object, object>("api/interviews", apiRequest);
            return result != null;
        }

        public async Task<bool> UpdateInterviewAsync(string interviewId, UpdateInterviewRequest request)
        {
            if (!int.TryParse(interviewId, out var id))
                return false;
            var apiRequest = new
            {
                request.ScheduledAt,
                request.DurationMinutes,
                request.MeetingLink,
                request.Notes,
                Status = request.Status
            };
            var result = await _apiService.PutAsync<object, object>($"api/interviews/{id}", apiRequest);
            return result != null;
        }

        private static EmployerProfileDto MapProfile(ApiEmployerProfileDto p) => new()
        {
            Id = p.Id.ToString(),
            UserId = p.UserId.ToString(),
            CompanyName = p.CompanyName,
            CompanyLogoUrl = p.CompanyLogoUrl ?? "",
            Website = p.Website ?? "",
            Description = p.CompanyDescription ?? "",
            Industry = p.Industry ?? "",
            Location = p.Location ?? ""
        };

        private sealed class ApiEmployerProfileDto
        {
            public int Id { get; set; }
            public int UserId { get; set; }
            public string Email { get; set; } = "";
            public string CompanyName { get; set; } = "";
            public string? CompanyDescription { get; set; }
            public string? Website { get; set; }
            public string? Industry { get; set; }
            public string? Location { get; set; }
            public string? CompanyLogoUrl { get; set; }
        }

    }
}