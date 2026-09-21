using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class ApplicationStatusHistoryConfiguration
    : IEntityTypeConfiguration<ApplicationStatusHistory>
{
    public void Configure(EntityTypeBuilder<ApplicationStatusHistory> builder)
    {
        builder.ToTable("application_status_histories");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OldStatus)
            .IsRequired();

        builder.Property(x => x.NewStatus)
            .IsRequired();

        builder.Property(x => x.ChangedAt)
            .IsRequired();

        builder.Property(x => x.Note)
            .HasMaxLength(2000);

        builder.HasIndex(x => x.ApplicationId);

        builder.HasIndex(x => x.ChangedByUserId);

        builder.HasIndex(x => x.ChangedAt);

        builder.HasOne(x => x.Application)
            .WithMany(x => x.StatusHistory)
            .HasForeignKey(x => x.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.ChangedByUser)
            .WithMany(x => x.ApplicationStatusHistories)
            .HasForeignKey(x => x.ChangedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}