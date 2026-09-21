using JobPortal.Application.Configuration;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Infrastructure.Data.Context;
using JobPortal.Infrastructure.Repositories;
using JobPortal.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JobPortal.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString =
            configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Database connection string 'DefaultConnection' was not found.");
        }

        services.AddDbContext<JobPortalDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });

        services.AddScoped<IUserRepository, UserRepository>();

        services.AddScoped<
            Microsoft.AspNetCore.Identity.IPasswordHasher<User>,
            Microsoft.AspNetCore.Identity.PasswordHasher<User>>();

        services.AddScoped<IPasswordHasher, AspNetPasswordHasher>();

        services.Configure<JwtSettings>(options =>
        {
            var section = configuration.GetSection("Jwt");
            options.Key = section["Key"] ?? string.Empty;
            options.Issuer = section["Issuer"] ?? string.Empty;
            options.Audience = section["Audience"] ?? string.Empty;
            options.ExpirationMinutes = int.TryParse(section["ExpirationMinutes"], out var m) ? m : 0;
        });

        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<ICandidateRepository, CandidateRepository>();
        services.AddScoped<IEmployerRepository, EmployerRepository>();
        services.AddScoped<IJobRepository, JobRepository>();
        services.AddScoped<IJobApplicationRepository, JobApplicationRepository>();
        services.AddScoped<IInterviewRepository, InterviewRepository>();
        services.AddScoped<ICompanyRepository, CompanyRepository>();
        services.AddScoped<ISkillRepository, SkillRepository>();
        services.AddScoped<IJobSkillRepository, JobSkillRepository>();
        services.AddScoped<IResumeRepository, ResumeRepository>();
        services.AddScoped<ISavedJobRepository, SavedJobRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();

        return services;
    }
}