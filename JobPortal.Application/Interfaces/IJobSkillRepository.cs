using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface IJobSkillRepository
{
    Task<IReadOnlyList<JobSkill>> GetByJobIdAsync(
        int jobId,
        CancellationToken cancellationToken = default);

    Task AddRangeAsync(
        IEnumerable<JobSkill> jobSkills,
        CancellationToken cancellationToken = default);

    Task DeleteByJobIdAsync(
        int jobId,
        CancellationToken cancellationToken = default);
}