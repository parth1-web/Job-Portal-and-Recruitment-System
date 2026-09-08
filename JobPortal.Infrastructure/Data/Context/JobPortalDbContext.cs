using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobPortal.Infrastructure.Data.Context;

public class JobPortalDbContext : DbContext
{
    public JobPortalDbContext(DbContextOptions<JobPortalDbContext> options)
        : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<User> Users => Set<User>();

    public DbSet<Candidate> Candidates => Set<Candidate>();

    public DbSet<Employer> Employers => Set<Employer>();

    public DbSet<Company> Companies => Set<Company>();

    public DbSet<JobCategory> JobCategories => Set<JobCategory>();

    public DbSet<Job> Jobs => Set<Job>();

    public DbSet<Skill> Skills => Set<Skill>();

    public DbSet<CandidateSkill> CandidateSkills => Set<CandidateSkill>();

    public DbSet<JobSkill> JobSkills => Set<JobSkill>();

    public DbSet<Resume> Resumes => Set<Resume>();

    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    public DbSet<SavedJob> SavedJobs => Set<SavedJob>();

    public DbSet<Interview> Interviews => Set<Interview>();

    public DbSet<Notification> Notifications => Set<Notification>();

    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories
        => Set<ApplicationStatusHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(JobPortalDbContext).Assembly);
    }
}