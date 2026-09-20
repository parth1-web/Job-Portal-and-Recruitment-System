using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    public interface IJobService
    {
        Task<PagedResult<JobListDto>?> GetJobsAsync(JobFilterRequest filter);
        Task<JobDetailDto?> GetJobByIdAsync(string id);
        Task<JobDetailDto?> CreateJobAsync(CreateJobRequest request);
        Task<JobDetailDto?> UpdateJobAsync(string id, UpdateJobRequest request);
        Task<bool> DeleteJobAsync(string id);
        Task<bool> SaveJobAsync(string jobId);
        Task<bool> UnsaveJobAsync(string jobId);
        Task<PagedResult<JobListDto>?> GetSavedJobsAsync(int page = 1, int pageSize = 10);
        Task<PagedResult<JobApplicationDto>?> GetApplicationsAsync(string? jobId = null, int page = 1, int pageSize = 10);
        Task<JobApplicationDto?> ApplyToJobAsync(CreateApplicationRequest request);
        Task<JobApplicationDto?> UpdateApplicationStatusAsync(string jobId, string applicationId, UpdateApplicationStatusRequest request);
        Task<List<string>> GetJobCategoriesAsync();
        Task<List<SkillDto>> GetSkillsAsync();
    }
}