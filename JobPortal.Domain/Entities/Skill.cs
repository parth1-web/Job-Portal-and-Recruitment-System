using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class Skill : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<CandidateSkill> CandidateSkills { get; set; }
        = new List<CandidateSkill>();

    public ICollection<JobSkill> JobSkills { get; set; }
        = new List<JobSkill>();
}