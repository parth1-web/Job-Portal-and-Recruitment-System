using System.Security.Claims;

using JobPortal.Application.DTOs.Applications;
using JobPortal.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/employer/jobs/{jobId}/applications")]
[Authorize(Roles = "Employer")]
public class EmployerJobApplicationController : ControllerBase
{
    private readonly IJobApplicationService _applicationService;

    public EmployerJobApplicationController(IJobApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetApplicationsForJob(
        string jobId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var applications = await _applicationService.GetApplicationsForJobAsync(
            userId,
            jobId,
            cancellationToken);

        return Ok(applications);
    }

    [HttpPut("{applicationId}/status")]
    public async Task<IActionResult> UpdateStatus(
        string jobId,
        string applicationId,
        [FromBody] UpdateJobApplicationStatusDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        try
        {
            var application = await _applicationService.UpdateStatusAsync(
                userId,
                applicationId,
                request,
                cancellationToken);

            if (application is null)
            {
                return NotFound(new { message = "Application not found." });
            }

            return Ok(application);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
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