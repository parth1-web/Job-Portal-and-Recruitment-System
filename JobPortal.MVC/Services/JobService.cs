using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    public class JobService : IJobService
    {
        private readonly IApiService _apiService;

        public JobService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<PagedResult<JobListDto>?> GetJobsAsync(JobFilterRequest filter)
        {
            var queryParams = new List<string>
            {
                $"page={filter.Page}",
                $"pageSize={filter.PageSize}",
                $"sortBy={Uri.EscapeDataString(filter.SortBy)}",
                $"sortDirection={Uri.EscapeDataString(filter.SortDirection)}"
            };

            if (!string.IsNullOrEmpty(filter.SearchTerm))
                queryParams.Add($"searchTerm={Uri.EscapeDataString(filter.SearchTerm)}");
            if (!string.IsNullOrEmpty(filter.Location))
                queryParams.Add($"location={Uri.EscapeDataString(filter.Location)}");
            if (!string.IsNullOrEmpty(filter.WorkMode))
                queryParams.Add($"workMode={filter.WorkMode}");
            if (!string.IsNullOrEmpty(filter.EmploymentType))
                queryParams.Add($"employmentType={filter.EmploymentType}");
            if (filter.MinSalary.HasValue)
                queryParams.Add($"minSalary={filter.MinSalary.Value}");
            if (filter.MaxSalary.HasValue)
                queryParams.Add($"maxSalary={filter.MaxSalary.Value}");
            if (filter.SkillIds?.Any() == true)
                queryParams.Add($"skillIds={string.Join(",", filter.SkillIds)}");
            if (!string.IsNullOrEmpty(filter.CompanyId))
                queryParams.Add($"companyId={filter.CompanyId}");
            if (!string.IsNullOrEmpty(filter.Status))
                queryParams.Add($"status={filter.Status}");

            var queryString = string.Join("&", queryParams);
            return await _apiService.GetAsync<PagedResult<JobListDto>>($"api/jobs?{queryString}");
        }

        public async Task<JobDetailDto?> GetJobByIdAsync(string id)
        {
            return await _apiService.GetAsync<JobDetailDto>($"api/jobs/{id}");
        }

        public async Task<JobDetailDto?> CreateJobAsync(CreateJobRequest request)
        {
            // API CreateJobDto uses Skills[] and ApplicationDeadline; map from MVC shape.
            var apiRequest = new ApiCreateJobRequest
            {
                CompanyId = request.CompanyId ?? "",
                CategoryId = request.CategoryId ?? "",
                Title = request.Title,
                Description = request.Description,
                Requirements = request.Requirements,
                Benefits = request.Benefits,
                MinSalary = request.MinSalary,
                MaxSalary = request.MaxSalary,
                Currency = request.Currency,
                EmploymentType = request.EmploymentType,
                WorkMode = request.WorkMode,
                Location = request.Location,
                Responsibilities = request.Responsibilities,
                PreferredQualifications = request.PreferredQualifications,
                ApplicationDeadline = request.ExpiryDate,
                Skills = request.SkillIds.Select(s => new ApiJobSkill { SkillId = s, IsRequired = true }).ToList(),
                Status = "Draft"
            };
            return await _apiService.PostAsync<ApiCreateJobRequest, JobDetailDto>("api/employer/jobs", apiRequest);
        }

        public async Task<JobDetailDto?> UpdateJobAsync(string id, UpdateJobRequest request)
        {
            var apiRequest = new ApiCreateJobRequest
            {
                CompanyId = request.CompanyId ?? "",
                CategoryId = request.CategoryId ?? "",
                Title = request.Title,
                Description = request.Description,
                Requirements = request.Requirements,
                Benefits = request.Benefits,
                MinSalary = request.MinSalary,
                MaxSalary = request.MaxSalary,
                Currency = request.Currency,
                EmploymentType = request.EmploymentType,
                WorkMode = request.WorkMode,
                Location = request.Location,
                Responsibilities = request.Responsibilities,
                PreferredQualifications = request.PreferredQualifications,
                ApplicationDeadline = request.ExpiryDate,
                Skills = request.SkillIds.Select(s => new ApiJobSkill { SkillId = s, IsRequired = true }).ToList(),
                Status = request.Status
            };
            return await _apiService.PutAsync<ApiCreateJobRequest, JobDetailDto>($"api/employer/jobs/{id}", apiRequest);
        }

        public async Task<bool> DeleteJobAsync(string id)
        {
            // The API exposes Close (POST {id}/close), not DELETE. Closing removes
            // the posting from public listings, which is the equivalent action.
            try
            {
                await _apiService.PostAsync<object, JobDetailDto>($"api/employer/jobs/{id}/close", new { });
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> SaveJobAsync(string jobId)
        {
            var result = await _apiService.PostAsync<object, ApiSavedJobDto>($"api/candidate/saved-jobs/{jobId}", new { });
            return result != null;
        }

        public async Task<bool> UnsaveJobAsync(string jobId)
        {
            return await _apiService.DeleteAsync($"api/candidate/saved-jobs/{jobId}");
        }

        public async Task<PagedResult<JobListDto>?> GetSavedJobsAsync(int page = 1, int pageSize = 10)
        {
            // The API returns a plain list; page it client-side for the UI.
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
            return ToPaged(jobs, page, pageSize);
        }

        public async Task<PagedResult<JobApplicationDto>?> GetApplicationsAsync(string? jobId = null, int page = 1, int pageSize = 10)
        {
            if (string.IsNullOrEmpty(jobId))
                return ToPaged(new List<JobApplicationDto>(), page, pageSize);

            var items = await _apiService.GetAsync<List<JobApplicationDto>>($"api/employer/jobs/{jobId}/applications")
                ?? new List<JobApplicationDto>();
            return ToPaged(items.OrderByDescending(a => a.AppliedAt).ToList(), page, pageSize);
        }

        public async Task<JobApplicationDto?> ApplyToJobAsync(CreateApplicationRequest request)
        {
            var apiRequest = new
            {
                JobId = request.JobId,
                ResumeId = string.IsNullOrEmpty(request.ResumeId) ? null : request.ResumeId,
                CoverLetter = request.CoverLetter
            };
            return await _apiService.PostAsync<object, JobApplicationDto>("api/candidate/applications", apiRequest);
        }

        public async Task<JobApplicationDto?> UpdateApplicationStatusAsync(string jobId, string applicationId, UpdateApplicationStatusRequest request)
        {
            var apiRequest = new { Status = request.Status, Note = request.Notes ?? request.RejectionReason };
            return await _apiService.PutAsync<object, JobApplicationDto>($"api/employer/jobs/{jobId}/applications/{applicationId}/status", apiRequest);
        }

        public async Task<List<string>> GetJobCategoriesAsync()
        {
            return await _apiService.GetAsync<List<string>>("api/jobs/categories") ?? new List<string>();
        }

        public async Task<List<SkillDto>> GetSkillsAsync()
        {
            var items = await _apiService.GetAsync<List<ApiSkillDto>>("api/skills") ?? new List<ApiSkillDto>();
            return items.Select(s => new SkillDto { Id = s.Id, Name = s.Name }).ToList();
        }

        internal static PagedResult<T> ToPaged<T>(List<T> items, int page, int pageSize)
        {
            page = page > 0 ? page : 1;
            pageSize = pageSize > 0 ? pageSize : 10;
            return new PagedResult<T>
            {
                Items = items.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
                TotalCount = items.Count,
                Page = page,
                PageSize = pageSize
            };
        }

        private sealed class ApiCreateJobRequest
        {
            public string CompanyId { get; set; } = "";
            public string CategoryId { get; set; } = "";
            public string Title { get; set; } = "";
            public string Description { get; set; } = "";
            public string? Requirements { get; set; }
            public string? Benefits { get; set; }
            public decimal? MinSalary { get; set; }
            public decimal? MaxSalary { get; set; }
            public string Currency { get; set; } = "USD";
            public string EmploymentType { get; set; } = "FullTime";
            public string WorkMode { get; set; } = "OnSite";
            public string Location { get; set; } = "";
            public string? Responsibilities { get; set; }
            public string? PreferredQualifications { get; set; }
            public DateTime? ApplicationDeadline { get; set; }
            public List<ApiJobSkill> Skills { get; set; } = new();
            public string Status { get; set; } = "Draft";
        }

        private sealed class ApiJobSkill
        {
            public string SkillId { get; set; } = "";
            public bool IsRequired { get; set; }
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