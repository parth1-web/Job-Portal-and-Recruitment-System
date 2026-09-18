using JobPortal.Application.DTOs.Skill;

namespace JobPortal.Application.Interfaces;

public interface ISkillService
{
    Task<SkillDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SkillDto>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<SkillDto> CreateAsync(
        CreateSkillDto dto,
        CancellationToken cancellationToken = default);

    Task<SkillDto?> UpdateAsync(
        int id,
        UpdateSkillDto dto,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}