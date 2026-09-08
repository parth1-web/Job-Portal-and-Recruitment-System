using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class JobCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public ICollection<Job> Jobs { get; set; }
        = new List<Job>();
}