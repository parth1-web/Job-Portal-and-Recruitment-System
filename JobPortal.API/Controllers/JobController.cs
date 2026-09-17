using JobPortal.Application.Interfaces;
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
        CancellationToken cancellationToken)
    {
        var jobs = await _jobService.GetPublishedJobsAsync(cancellationToken);

        return Ok(jobs);
    }

    // GET: api/jobs/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPublishedJobById(
        int id,
        CancellationToken cancellationToken)
    {
        var job = await _jobService.GetPublishedJobByIdAsync(
            id,
            cancellationToken);

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