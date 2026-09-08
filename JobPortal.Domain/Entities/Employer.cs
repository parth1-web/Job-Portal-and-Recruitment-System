using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class Employer : BaseEntity
{
    public int UserId { get; set; }

    public int CompanyId { get; set; }

    public string Position { get; set; } = string.Empty;

    public User User { get; set; } = null!;

    public Company Company { get; set; } = null!;

    public ICollection<Job> Jobs { get; set; }
        = new List<Job>();
}