using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    public interface IEmployerService
    {
        Task<EmployerProfileDto?> GetProfileAsync();
        Task<EmployerProfileDto?> UpdateProfileAsync(EmployerProfileDto profile);
        Task<PagedResult<JobListDto>?> GetMyJobsAsync(int page = 1, int pageSize = 10, string? status = null);
        Task<PagedResult<JobApplicationDto>?> GetApplicationsAsync(string? jobId = null, int page = 1, int pageSize = 10);
        Task<PagedResult<InterviewDto>?> GetInterviewsAsync(int page = 1, int pageSize = 10);
        Task<DashboardStatsDto?> GetDashboardStatsAsync();
        Task<bool> CreateInterviewAsync(CreateInterviewRequest request);
        Task<bool> UpdateInterviewAsync(string interviewId, UpdateInterviewRequest request);
    }
}