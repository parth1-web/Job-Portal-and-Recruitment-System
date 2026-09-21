using JobPortal.Domain.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class CandidateConfiguration
    : IEntityTypeConfiguration<Candidate>
{
    public void Configure(
        EntityTypeBuilder<Candidate> builder)
    {
        builder.ToTable("Candidates");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.PhoneNumber)
            .HasMaxLength(30);

        builder.Property(x => x.Location)
            .HasMaxLength(200);

        builder.Property(x => x.ProfessionalTitle)
            .HasMaxLength(150);

        builder.Property(x => x.Bio)
            .HasMaxLength(2000);

        builder.Property(x => x.ResumeUrl)
            .HasMaxLength(500);

        builder.HasOne(x => x.User)
            .WithOne(x => x.Candidate)
            .HasForeignKey<Candidate>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.UserId)
            .IsUnique();
    }
}