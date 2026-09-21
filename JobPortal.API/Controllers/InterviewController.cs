using System.Security.Claims;

using JobPortal.Application.DTOs.Interviews;
using JobPortal.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/interviews")]
[Authorize]
public class InterviewController : ControllerBase
{
    private readonly IInterviewService _interviewService;

    public InterviewController(IInterviewService interviewService)
    {
        _interviewService = interviewService;
    }

    [HttpPost]
    [Authorize(Roles = "Employer,Admin")]
    public async Task<IActionResult> Schedule(
        [FromBody] CreateInterviewDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        try
        {
            var interview = await _interviewService.ScheduleAsync(
                userId,
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = interview.Id },
                interview);
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

    [HttpGet("application/{applicationId:int}")]
    public async Task<IActionResult> GetByApplicationId(
        int applicationId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var interviews = await _interviewService.GetByApplicationIdAsync(
            applicationId,
            cancellationToken);

        return Ok(interviews);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var interview = await _interviewService.GetByIdAsync(id, cancellationToken);

        if (interview is null)
        {
            return NotFound(new { message = "Interview not found." });
        }

        return Ok(interview);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateInterviewDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        try
        {
            var interview = await _interviewService.UpdateAsync(
                userId,
                id,
                request,
                cancellationToken);

            if (interview is null)
            {
                return NotFound(new { message = "Interview not found." });
            }

            return Ok(interview);
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

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        try
        {
            await _interviewService.CancelAsync(userId, id, cancellationToken);
            return NoContent();
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