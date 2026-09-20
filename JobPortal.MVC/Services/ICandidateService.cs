using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    public interface ICandidateService
    {
        Task<CandidateProfileDto?> GetProfileAsync();
        Task<CandidateProfileDto?> UpdateProfileAsync(CandidateProfileDto profile);
        Task<bool> UploadResumeAsync(CreateResumeRequest request);
        Task<List<ResumeDto>> GetResumesAsync();
        Task<bool> DeleteResumeAsync(string resumeId);
        Task<PagedResult<JobApplicationDto>?> GetApplicationsAsync(int page = 1, int pageSize = 10);
        Task<PagedResult<JobListDto>?> GetSavedJobsAsync(int page = 1, int pageSize = 10);
        Task<PagedResult<InterviewDto>?> GetInterviewsAsync(int page = 1, int pageSize = 10);
        Task<DashboardStatsDto?> GetDashboardStatsAsync();
        Task<List<SkillDto>> GetSkillsAsync();
    }
}