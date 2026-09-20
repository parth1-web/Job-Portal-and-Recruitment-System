using JobPortal.Application.Configuration;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;
using Microsoft.Extensions.Options;

namespace JobPortal.Tests.Helpers;

public static class TestHelpers
{
    public static IOptions<JwtSettings> CreateJwtSettings()
    {
        var settings = new JwtSettings
        {
            Key = "TestSecretKeyForTestingPurposesOnly123456789",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            ExpirationMinutes = 60
        };
        return Options.Create(settings);
    }

    public static User CreateTestUser(int id = 1, string email = "test@example.com", string roleName = "Candidate")
    {
        return new User
        {
            Id = id,
            Email = email,
            PasswordHash = "hashed_password",
            RoleId = roleName == "Admin" ? 1 : (roleName == "Employer" ? 2 : 3),
            IsActive = true,
            Role = new Role { Id = roleName == "Admin" ? 1 : (roleName == "Employer" ? 2 : 3), Name = roleName }
        };
    }

    public static Candidate CreateTestCandidate(int id = 1, int userId = 1)
    {
        return new Candidate
        {
            Id = id,
            UserId = userId,
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = "+1234567890",
            Location = "New York, NY",
            ProfessionalTitle = "Software Engineer",
            Bio = "Experienced software engineer",
            ResumeUrl = "https://example.com/resume.pdf"
        };
    }

    public static Employer CreateTestEmployer(int id = 1, int userId = 2)
    {
        return new Employer
        {
            Id = id,
            UserId = userId,
            CompanyName = "Tech Corp",
            CompanyDescription = "Leading technology company",
            Website = "https://techcorp.com",
            Industry = "Technology",
            Location = "San Francisco, CA",
            CompanyLogoUrl = "https://techcorp.com/logo.png"
        };
    }

    public static Company CreateTestCompany(int id = 1)
    {
        return new Company
        {
            Id = id,
            Name = "Tech Corp",
            Description = "Leading technology company",
            WebsiteUrl = "https://techcorp.com",
            Location = "San Francisco, CA",
            LogoUrl = "https://techcorp.com/logo.png"
        };
    }

    public static Job CreateTestJob(int id = 1, int employerId = 1, int companyId = 1, int categoryId = 1)
    {
        return new Job
        {
            Id = id,
            EmployerId = employerId,
            CompanyId = companyId,
            CategoryId = categoryId,
            Title = "Senior Software Engineer",
            Description = "We are looking for a senior software engineer...",
            Requirements = "5+ years experience with .NET",
            SalaryMin = 100000,
            SalaryMax = 150000,
            EmploymentType = EmploymentType.FullTime,
            WorkMode = WorkMode.Hybrid,
            Location = "San Francisco, CA",
            ApplicationDeadline = DateTime.UtcNow.AddDays(30),
            Status = JobStatus.Published,
            Employer = CreateTestEmployer(employerId),
            Company = CreateTestCompany(companyId),
            Category = new JobCategory { Id = categoryId, Name = "Software Development" }
        };
    }

    public static JobApplication CreateTestJobApplication(int id = 1, int jobId = 1, int candidateId = 1, int resumeId = 1)
    {
        return new JobApplication
        {
            Id = id,
            JobId = jobId,
            CandidateId = candidateId,
            ResumeId = resumeId,
            CoverLetter = "I am very interested in this position...",
            Status = ApplicationStatus.Applied,
            AppliedAt = DateTime.UtcNow,
            Job = CreateTestJob(jobId),
            Candidate = CreateTestCandidate(candidateId),
            Resume = new Resume { Id = resumeId, CandidateId = candidateId, FileName = "resume.pdf", FileUrl = "https://example.com/resume.pdf", IsDefault = true }
        };
    }

    public static Skill CreateTestSkill(int id = 1, string name = "C#")
    {
        return new Skill { Id = id, Name = name };
    }
}