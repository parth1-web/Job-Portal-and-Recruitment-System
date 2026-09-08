using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class Company : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? WebsiteUrl { get; set; }

    public string? Location { get; set; }

    public string? LogoUrl { get; set; }

    public ICollection<Employer> Employers { get; set; }
        = new List<Employer>();

    public ICollection<Job> Jobs { get; set; }
        = new List<Job>();
}