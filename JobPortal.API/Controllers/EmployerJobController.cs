using System.Security.Claims;
using JobPortal.Application.DTOs.Jobs;
using JobPortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/employer/jobs")]
[Authorize(Roles = "Employer")]
public class EmployerJobController : ControllerBase
{
    private readonly IJobService _jobService;

    public EmployerJobController(IJobService jobService)
    {
        _jobService = jobService;
    }

    // =========================================================
    // CREATE JOB
    // POST: /api/employer/jobs
    // =========================================================

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateJobDto request,
        CancellationToken cancellationToken)
    {
        var employerId = GetEmployerId();

        if (employerId is null)
        {
            return Unauthorized();
        }

        try
        {
            var job = await _jobService.CreateAsync(
                employerId.Value,
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = job.Id },
                job);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // GET ALL EMPLOYER JOBS
    // GET: /api/employer/jobs
    // =========================================================

    [HttpGet]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var employerId = GetEmployerId();

        if (employerId is null)
        {
            return Unauthorized();
        }

        var jobs = await _jobService.GetEmployerJobsAsync(
            employerId.Value,
            cancellationToken);

        return Ok(jobs);
    }

    // =========================================================
    // GET SINGLE EMPLOYER JOB
    // GET: /api/employer/jobs/{id}
    // =========================================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        string id,
        CancellationToken cancellationToken)
    {
        var employerId = GetEmployerId();

        if (employerId is null)
        {
            return Unauthorized();
        }

        var job = await _jobService.GetEmployerJobByIdAsync(
            employerId.Value,
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

    // =========================================================
    // UPDATE JOB
    // PUT: /api/employer/jobs/{id}
    // =========================================================

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        string id,
        [FromBody] UpdateJobDto request,
        CancellationToken cancellationToken)
    {
        var employerId = GetEmployerId();

        if (employerId is null)
        {
            return Unauthorized();
        }

        try
        {
            var job = await _jobService.UpdateAsync(
                employerId.Value,
                id,
                request,
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // PUBLISH JOB
    // POST: /api/employer/jobs/{id}/publish
    // =========================================================

    [HttpPost("{id}/publish")]
    public async Task<IActionResult> Publish(
        string id,
        CancellationToken cancellationToken)
    {
        var employerId = GetEmployerId();

        if (employerId is null)
        {
            return Unauthorized();
        }

        try
        {
            var job = await _jobService.PublishAsync(
                employerId.Value,
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // CLOSE JOB
    // POST: /api/employer/jobs/{id}/close
    // =========================================================

    [HttpPost("{id}/close")]
    public async Task<IActionResult> Close(
        string id,
        CancellationToken cancellationToken)
    {
        var employerId = GetEmployerId();

        if (employerId is null)
        {
            return Unauthorized();
        }

        try
        {
            var job = await _jobService.CloseAsync(
                employerId.Value,
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // GET EMPLOYER ID FROM JWT
    // =========================================================

    private int? GetEmployerId()
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var employerId))
        {
            return null;
        }

        return employerId;
    }
}