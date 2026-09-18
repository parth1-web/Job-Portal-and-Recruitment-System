using System.Security.Claims;

using JobPortal.Application.DTOs.SavedJobs;
using JobPortal.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/candidate/saved-jobs")]
[Authorize(Roles = "Candidate")]
public class SavedJobController : ControllerBase
{
    private readonly ISavedJobService _savedJobService;

    public SavedJobController(ISavedJobService savedJobService)
    {
        _savedJobService = savedJobService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSavedJobs(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var savedJobs = await _savedJobService.GetSavedJobsAsync(userId, cancellationToken);
        return Ok(savedJobs);
    }

    [HttpPost("{jobId:int}")]
    public async Task<IActionResult> SaveJob(
        int jobId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        try
        {
            var savedJob = await _savedJobService.SaveJobAsync(userId, jobId, cancellationToken);
            return CreatedAtAction(nameof(GetSavedJobs), new { }, savedJob);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{jobId:int}")]
    public async Task<IActionResult> UnsaveJob(
        int jobId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var deleted = await _savedJobService.UnsaveJobAsync(userId, jobId, cancellationToken);

        if (!deleted)
        {
            return NotFound(new { message = "Saved job not found." });
        }

        return NoContent();
    }

    [HttpGet("{jobId:int}/check")]
    public async Task<IActionResult> IsJobSaved(
        int jobId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var isSaved = await _savedJobService.IsJobSavedAsync(userId, jobId, cancellationToken);
        return Ok(new { isSaved });
    }

    private int GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user identity.");
        }

        return userId;
    }
}