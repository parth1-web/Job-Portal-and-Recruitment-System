using JobPortal.Domain.Common;

namespace JobPortal.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public int RoleId { get; set; }

    public bool IsActive { get; set; } = true;

    public Role Role { get; set; } = null!;

    public Candidate? Candidate { get; set; }

    public Employer? Employer { get; set; }

    public ICollection<Notification> Notifications { get; set; }
        = new List<Notification>();

    public ICollection<ApplicationStatusHistory> ApplicationStatusHistories { get; set; }
        = new List<ApplicationStatusHistory>();
}