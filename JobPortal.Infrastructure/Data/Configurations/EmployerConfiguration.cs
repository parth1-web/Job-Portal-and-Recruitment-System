using JobPortal.Domain.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class EmployerConfiguration
    : IEntityTypeConfiguration<Employer>
{
    public void Configure(
        EntityTypeBuilder<Employer> builder)
    {
        builder.ToTable("Employers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.CompanyDescription)
            .HasMaxLength(3000);

        builder.Property(x => x.Website)
            .HasMaxLength(500);

        builder.Property(x => x.Industry)
            .HasMaxLength(150);

        builder.Property(x => x.Location)
            .HasMaxLength(200);

        builder.Property(x => x.CompanyLogoUrl)
            .HasMaxLength(500);

        builder.HasOne(x => x.User)
            .WithOne(x => x.Employer)
            .HasForeignKey<Employer>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.UserId)
            .IsUnique();
    }
}