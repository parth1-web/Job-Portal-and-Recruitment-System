using System.Security.Claims;

using JobPortal.Application.DTOs.Employers;
using JobPortal.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/employer")]
[Authorize(Roles = "Employer")]
public class EmployerController : ControllerBase
{
    private readonly IEmployerService _employerService;

    public EmployerController(
        IEmployerService employerService)
    {
        _employerService = employerService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var profile =
            await _employerService.GetProfileAsync(
                userId,
                cancellationToken);

        if (profile is null)
        {
            return NotFound(new
            {
                message = "Employer profile not found."
            });
        }

        return Ok(profile);
    }

    [HttpPost("profile")]
    public async Task<IActionResult> CreateProfile(
        [FromBody] UpdateEmployerProfileDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();

            var profile =
                await _employerService.CreateProfileAsync(
                    userId,
                    request,
                    cancellationToken);

            return CreatedAtAction(
                nameof(GetProfile),
                null,
                profile);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateEmployerProfileDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();

            var profile =
                await _employerService.UpdateProfileAsync(
                    userId,
                    request,
                    cancellationToken);

            return Ok(profile);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    private int GetUserId()
    {
        var value =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid user identity.");
        }

        return userId;
    }
}