using JobPortal.Application.DTOs.Skill;

namespace JobPortal.Application.Interfaces;

public interface ISkillService
{
    Task<SkillDto?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SkillDto>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<SkillDto> CreateAsync(
        CreateSkillDto dto,
        CancellationToken cancellationToken = default);

    Task<SkillDto?> UpdateAsync(
        string id,
        UpdateSkillDto dto,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default);
}