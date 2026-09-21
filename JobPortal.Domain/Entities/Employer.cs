using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class Employer : BaseEntity
{
    public int UserId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string? CompanyDescription { get; set; }

    public string? Website { get; set; }

    public string? Industry { get; set; }

    public string? Location { get; set; }

    public string? CompanyLogoUrl { get; set; }

    public User User { get; set; } = null!;

    public ICollection<Job> Jobs { get; set; }
        = new List<Job>();
}