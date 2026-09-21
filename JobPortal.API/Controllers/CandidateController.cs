using System.Security.Claims;

using JobPortal.Application.DTOs.Candidates;
using JobPortal.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/candidate")]
[Authorize(Roles = "Candidate")]
public class CandidateController : ControllerBase
{
    private readonly ICandidateService _candidateService;

    public CandidateController(
        ICandidateService candidateService)
    {
        _candidateService = candidateService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var profile =
            await _candidateService.GetProfileAsync(
                userId,
                cancellationToken);

        if (profile is null)
        {
            return NotFound(new
            {
                message = "Candidate profile not found."
            });
        }

        return Ok(profile);
    }

    [HttpPost("profile")]
    public async Task<IActionResult> CreateProfile(
        [FromBody] UpdateCandidateProfileDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();

            var profile =
                await _candidateService.CreateProfileAsync(
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
        [FromBody] UpdateCandidateProfileDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();

            var profile =
                await _candidateService.UpdateProfileAsync(
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