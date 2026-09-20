using JobPortal.Application.DTOs.Skill;
using JobPortal.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/skills")]
public class SkillController : ControllerBase
{
    private readonly ISkillService _skillService;

    public SkillController(ISkillService skillService)
    {
        _skillService = skillService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var skills = await _skillService.GetAllAsync(cancellationToken);
        return Ok(skills);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        string id,
        CancellationToken cancellationToken)
    {
        var skill = await _skillService.GetByIdAsync(id, cancellationToken);

        if (skill is null)
        {
            return NotFound(new { message = "Skill not found." });
        }

        return Ok(skill);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateSkillDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var skill = await _skillService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = skill.Id }, skill);
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

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        string id,
        [FromBody] UpdateSkillDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var skill = await _skillService.UpdateAsync(id, request, cancellationToken);

            if (skill is null)
            {
                return NotFound(new { message = "Skill not found." });
            }

            return Ok(skill);
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

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        string id,
        CancellationToken cancellationToken)
    {
        var deleted = await _skillService.DeleteAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound(new { message = "Skill not found." });
        }

        return NoContent();
    }
}