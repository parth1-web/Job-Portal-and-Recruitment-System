using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class JobConfiguration : IEntityTypeConfiguration<Job>
{
    public void Configure(EntityTypeBuilder<Job> builder)
    {
        builder.ToTable("jobs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(10000);

        builder.Property(x => x.Requirements)
            .HasMaxLength(10000);

        builder.Property(x => x.SalaryMin)
            .HasPrecision(18, 2);

        builder.Property(x => x.SalaryMax)
            .HasPrecision(18, 2);

        builder.Property(x => x.EmploymentType)
            .IsRequired();

        builder.Property(x => x.WorkMode)
            .IsRequired();

        builder.Property(x => x.Location)
            .HasMaxLength(200);

        builder.Property(x => x.ApplicationDeadline)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        builder.HasIndex(x => x.Title);

        builder.HasIndex(x => x.CompanyId);

        builder.HasIndex(x => x.CategoryId);

        builder.HasIndex(x => x.EmployerId);

        builder.HasIndex(x => x.Status);

        builder.HasIndex(x => x.ApplicationDeadline);

        builder.HasOne(x => x.Employer)
            .WithMany(x => x.Jobs)
            .HasForeignKey(x => x.EmployerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Company)
            .WithMany(x => x.Jobs)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Category)
            .WithMany(x => x.Jobs)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}