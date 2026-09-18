using JobPortal.Application.DTOs.Skill;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Services;

public class SkillService : ISkillService
{
    private readonly ISkillRepository _skillRepository;

    public SkillService(ISkillRepository skillRepository)
    {
        _skillRepository = skillRepository;
    }

    public async Task<SkillDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var skill = await _skillRepository.GetByIdAsync(id, cancellationToken);
        return skill is null ? null : MapToDto(skill);
    }

    public async Task<IReadOnlyList<SkillDto>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var skills = await _skillRepository.GetAllAsync(cancellationToken);
        return skills.Select(MapToDto).ToList();
    }

    public async Task<SkillDto> CreateAsync(
        CreateSkillDto dto,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ArgumentException("Skill name is required.");
        }

        var existing = await _skillRepository.GetByNameAsync(dto.Name.Trim(), cancellationToken);
        if (existing is not null)
        {
            throw new InvalidOperationException("A skill with this name already exists.");
        }

        var skill = new Skill
        {
            Name = dto.Name.Trim()
        };

        await _skillRepository.AddAsync(skill, cancellationToken);

        var created = await _skillRepository.GetByIdAsync(skill.Id, cancellationToken);
        if (created is null)
        {
            throw new InvalidOperationException("Skill could not be retrieved after creation.");
        }

        return MapToDto(created);
    }

    public async Task<SkillDto?> UpdateAsync(
        int id,
        UpdateSkillDto dto,
        CancellationToken cancellationToken = default)
    {
        var skill = await _skillRepository.GetByIdAsync(id, cancellationToken);
        if (skill is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ArgumentException("Skill name cannot be empty.");
        }

        var existing = await _skillRepository.GetByNameAsync(dto.Name.Trim(), cancellationToken);
        if (existing is not null && existing.Id != id)
        {
            throw new InvalidOperationException("A skill with this name already exists.");
        }

        skill.Name = dto.Name.Trim();
        skill.UpdatedAt = DateTime.UtcNow;

        await _skillRepository.UpdateAsync(skill, cancellationToken);

        return MapToDto(skill);
    }

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var skill = await _skillRepository.GetByIdAsync(id, cancellationToken);
        if (skill is null)
        {
            return false;
        }

        await _skillRepository.DeleteAsync(skill, cancellationToken);
        return true;
    }

    private static SkillDto MapToDto(Skill skill)
    {
        return new SkillDto
        {
            Id = skill.Id,
            Name = skill.Name,
            CreatedAt = skill.CreatedAt,
            UpdatedAt = skill.UpdatedAt
        };
    }
}