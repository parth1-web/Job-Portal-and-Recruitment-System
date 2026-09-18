using System.Security.Claims;

using JobPortal.Application.DTOs.Resumes;
using JobPortal.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/candidate/resumes")]
[Authorize(Roles = "Candidate")]
public class ResumeController : ControllerBase
{
    private readonly IResumeService _resumeService;
    private readonly ICandidateService _candidateService;

    public ResumeController(
        IResumeService resumeService,
        ICandidateService candidateService)
    {
        _resumeService = resumeService;
        _candidateService = candidateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyResumes(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var candidate = await _candidateService.GetProfileAsync(userId, cancellationToken);

        if (candidate is null)
        {
            return NotFound(new { message = "Candidate profile not found." });
        }

        var resumes = await _resumeService.GetByCandidateIdAsync(candidate.Id, cancellationToken);
        return Ok(resumes);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var resume = await _resumeService.GetByIdAsync(id, cancellationToken);

        if (resume is null)
        {
            return NotFound(new { message = "Resume not found." });
        }

        return Ok(resume);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateResumeDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var candidate = await _candidateService.GetProfileAsync(userId, cancellationToken);

        if (candidate is null)
        {
            return NotFound(new { message = "Candidate profile not found." });
        }

        try
        {
            var resume = await _resumeService.CreateAsync(candidate.Id, request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = resume.Id }, resume);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateResumeDto request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var candidate = await _candidateService.GetProfileAsync(userId, cancellationToken);

        if (candidate is null)
        {
            return NotFound(new { message = "Candidate profile not found." });
        }

        try
        {
            var resume = await _resumeService.UpdateAsync(candidate.Id, id, request, cancellationToken);

            if (resume is null)
            {
                return NotFound(new { message = "Resume not found." });
            }

            return Ok(resume);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var candidate = await _candidateService.GetProfileAsync(userId, cancellationToken);

        if (candidate is null)
        {
            return NotFound(new { message = "Candidate profile not found." });
        }

        var deleted = await _resumeService.DeleteAsync(candidate.Id, id, cancellationToken);

        if (!deleted)
        {
            return NotFound(new { message = "Resume not found." });
        }

        return NoContent();
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