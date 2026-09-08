using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class InterviewConfiguration : IEntityTypeConfiguration<Interview>
{
    public void Configure(EntityTypeBuilder<Interview> builder)
    {
        builder.ToTable("interviews");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScheduledAt)
            .IsRequired();

        builder.Property(x => x.DurationMinutes)
            .IsRequired();

        builder.Property(x => x.MeetingLink)
            .HasMaxLength(1000);

        builder.Property(x => x.Notes)
            .HasMaxLength(3000);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.HasIndex(x => x.ApplicationId);

        builder.HasIndex(x => x.ScheduledAt);

        builder.HasOne(x => x.Application)
            .WithMany(x => x.Interviews)
            .HasForeignKey(x => x.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}