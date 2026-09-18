using System.Security.Claims;

using JobPortal.Application.DTOs.Applications;
using JobPortal.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/candidate/applications")]
[Authorize(Roles = "Candidate")]
public class JobApplicationController : ControllerBase
{
    private readonly IJobApplicationService _applicationService;

    public JobApplicationController(IJobApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [HttpPost]
    public async Task<IActionResult> Apply(
        [FromBody] CreateJobApplicationDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        try
        {
            var application = await _applicationService.ApplyAsync(
                userId,
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = application.Id },
                application);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetMyApplications(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var applications = await _applicationService.GetMyApplicationsAsync(
            userId,
            cancellationToken);

        return Ok(applications);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var application = await _applicationService.GetApplicationByIdAsync(
            userId,
            id,
            cancellationToken);

        if (application is null)
        {
            return NotFound(new { message = "Application not found." });
        }

        return Ok(application);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Withdraw(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        try
        {
            await _applicationService.WithdrawAsync(userId, id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
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