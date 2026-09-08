using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class JobApplicationConfiguration : IEntityTypeConfiguration<JobApplication>
{
    public void Configure(EntityTypeBuilder<JobApplication> builder)
    {
        builder.ToTable("job_applications");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CoverLetter)
            .HasMaxLength(5000);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.AppliedAt)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        builder.HasIndex(x => x.JobId);

        builder.HasIndex(x => x.CandidateId);

        builder.HasIndex(x => x.Status);

        builder.HasIndex(x => new
        {
            x.CandidateId,
            x.JobId
        })
        .IsUnique();

        builder.HasOne(x => x.Job)
            .WithMany(x => x.JobApplications)
            .HasForeignKey(x => x.JobId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Candidate)
            .WithMany(x => x.JobApplications)
            .HasForeignKey(x => x.CandidateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Resume)
            .WithMany(x => x.JobApplications)
            .HasForeignKey(x => x.ResumeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}