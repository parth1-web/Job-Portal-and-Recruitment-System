using JobPortal.Application.Interfaces;
using JobPortal.Application.DTOs.Common;
using JobPortal.Application.DTOs.Jobs;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/jobs")]
public class JobController : ControllerBase
{
    private readonly IJobService _jobService;

    public JobController(IJobService jobService)
    {
        _jobService = jobService;
    }

    // GET: api/jobs
    [HttpGet]
    public async Task<IActionResult> GetPublishedJobs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? location = null,
        [FromQuery] string? workMode = null,
        [FromQuery] string? employmentType = null,
        [FromQuery] decimal? minSalary = null,
        [FromQuery] decimal? maxSalary = null,
        [FromQuery] string? skillIds = null,
        [FromQuery] string? companyId = null,
        [FromQuery] string? status = "Published",
        [FromQuery] string sortBy = "PostedDate",
        [FromQuery] string sortDirection = "desc",
        CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var filter = new JobFilterDto
        {
            Page = page,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Location = location,
            WorkMode = workMode,
            EmploymentType = employmentType,
            MinSalary = minSalary,
            MaxSalary = maxSalary,
            SkillIds = skillIds?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
            CompanyId = companyId,
            Status = status,
            SortBy = sortBy,
            SortDirection = sortDirection
        };

        var result = await _jobService.GetPublishedJobsAsync(filter, cancellationToken);

        return Ok(result);
    }

    // GET: api/jobs/categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
    {
        var categories = await _jobService.GetJobCategoriesAsync(cancellationToken);
        return Ok(categories);
    }

    // GET: api/jobs/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPublishedJobById(
        string id,
        CancellationToken cancellationToken)
    {
        var job = await _jobService.GetPublishedJobByIdAsync(id, cancellationToken);

        if (job is null)
        {
            return NotFound(new
            {
                message = "Job not found."
            });
        }

        return Ok(job);
    }
}