using JobPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobPortal.Infrastructure.Data.Configurations;

public class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> builder)
    {
        builder.ToTable("skills");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(x => x.Name)
            .IsUnique();

        var seededAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        builder.HasData(
            new Skill { Id = 1, Name = "C#", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Skill { Id = 2, Name = "JavaScript", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Skill { Id = 3, Name = "Python", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Skill { Id = 4, Name = "SQL", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Skill { Id = 5, Name = "Java", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Skill { Id = 6, Name = "React", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Skill { Id = 7, Name = "ASP.NET Core", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Skill { Id = 8, Name = "Communication", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Skill { Id = 9, Name = "Project Management", CreatedAt = seededAt, UpdatedAt = seededAt },
            new Skill { Id = 10, Name = "Data Analysis", CreatedAt = seededAt, UpdatedAt = seededAt }
        );
    }
}