using JobPortal.Application.DTOs.Jobs;
using JobPortal.Application.DTOs.Common;
using JobPortal.Application.Interfaces;
using JobPortal.Application.Services;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;
using JobPortal.Tests.Helpers;
using Moq;

namespace JobPortal.Tests.Services;

public class JobServiceTests
{
    private readonly Mock<IJobRepository> _jobRepositoryMock;
    private readonly Mock<IEmployerRepository> _employerRepositoryMock;
    private readonly Mock<ISkillRepository> _skillRepositoryMock;
    private readonly Mock<IJobSkillRepository> _jobSkillRepositoryMock;
    private readonly JobService _jobService;

    public JobServiceTests()
    {
        _jobRepositoryMock = new Mock<IJobRepository>();
        _employerRepositoryMock = new Mock<IEmployerRepository>();
        _skillRepositoryMock = new Mock<ISkillRepository>();
        _jobSkillRepositoryMock = new Mock<IJobSkillRepository>();
        
        _jobService = new JobService(
            _jobRepositoryMock.Object,
            _employerRepositoryMock.Object,
            _skillRepositoryMock.Object,
            _jobSkillRepositoryMock.Object);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ReturnsJobDto()
    {
        // Arrange
        var userId = 1;
        var employer = TestHelpers.CreateTestEmployer(1, userId);
        var company = TestHelpers.CreateTestCompany(1);
        var category = new JobCategory { Id = 1, Name = "Software Development" };
        
        var request = new CreateJobDto
        {
            CompanyId = "1",
            CategoryId = "1",
            Title = "Senior Software Engineer",
            Description = "We are looking for a senior software engineer...",
            Requirements = "5+ years experience with .NET",
            SalaryMin = 100000,
            SalaryMax = 150000,
            EmploymentType = "FullTime",
            WorkMode = "Hybrid",
            Location = "San Francisco, CA",
            ApplicationDeadline = DateTime.UtcNow.AddDays(30),
            Skills = new List<CreateJobSkillDto>
            {
                new() { SkillId = "1", IsRequired = true },
                new() { SkillId = "2", IsRequired = false }
            }
        };

        var createdJob = TestHelpers.CreateTestJob(1);
        createdJob.Status = JobStatus.Draft; // Service creates jobs as Draft
        createdJob.JobSkills = new List<JobSkill>
        {
            new() { JobId = 1, SkillId = 1, IsRequired = true, Skill = TestHelpers.CreateTestSkill(1, "C#") },
            new() { JobId = 1, SkillId = 2, IsRequired = false, Skill = TestHelpers.CreateTestSkill(2, "SQL") }
        };

        Job? capturedJob = null;
        
        _employerRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employer);
        
        _skillRepositoryMock.Setup(x => x.GetByIdsAsync(It.IsAny<IEnumerable<int>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Skill> { TestHelpers.CreateTestSkill(1, "C#"), TestHelpers.CreateTestSkill(2, "SQL") });
        
        _jobRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()))
            .Callback<Job, CancellationToken>((job, _) => 
            {
                job.Id = 1;
                capturedJob = job;
            })
            .Returns(Task.CompletedTask);
        _jobRepositoryMock.Setup(x => x.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdJob);
        
        _jobSkillRepositoryMock.Setup(x => x.AddRangeAsync(It.IsAny<IEnumerable<JobSkill>>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _jobService.CreateAsync(userId, request);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(request.Title);
        result.CompanyId.Should().Be(request.CompanyId);
        result.CategoryId.Should().Be(request.CategoryId);
        result.Status.Should().Be(JobStatus.Draft.ToString());
    }

    [Fact]
    public async Task CreateAsync_WithNoEmployerProfile_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var request = new CreateJobDto
        {
            CompanyId = "1",
            CategoryId = "1",
            Title = "Senior Software Engineer",
            Description = "Description",
            ApplicationDeadline = DateTime.UtcNow.AddDays(30)
        };

        _employerRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Employer?)null);

        // Act & Assert
        await _jobService.Invoking(x => x.CreateAsync(userId, request))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Employer profile was not found*");
    }

    [Fact]
    public async Task CreateAsync_WithInvalidSkillIds_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var employer = TestHelpers.CreateTestEmployer(1, userId);
        
        var request = new CreateJobDto
        {
            CompanyId = "1",
            CategoryId = "1",
            Title = "Senior Software Engineer",
            Description = "Description",
            ApplicationDeadline = DateTime.UtcNow.AddDays(30),
            Skills = new List<CreateJobSkillDto>
            {
                new() { SkillId = "999", IsRequired = true }
            }
        };

        _employerRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employer);
        
        _skillRepositoryMock.Setup(x => x.GetByIdsAsync(It.IsAny<IEnumerable<int>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Skill>()); // Empty - skill not found

        // Act & Assert
        await _jobService.Invoking(x => x.CreateAsync(userId, request))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*skill IDs were not found*");
    }

    [Fact]
    public async Task GetPublishedJobsAsync_ReturnsJobListDtos()
    {
        // Arrange
        var jobs = new List<Job>
        {
            TestHelpers.CreateTestJob(1),
            TestHelpers.CreateTestJob(2, 1, 1, 2)
        };

        var filter = new JobFilterDto { Page = 1, PageSize = 10 };

        _jobRepositoryMock.Setup(x => x.GetPublishedJobsAsync(It.Is<JobFilterDto>(f => f.Page == 1 && f.PageSize == 10), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedResult<Job> { Items = jobs, TotalCount = jobs.Count, Page = 1, PageSize = 10 });

        // Act
        var result = await _jobService.GetPublishedJobsAsync(filter);

        // Assert
        result.Should().NotBeNull();
        result!.Items.Should().HaveCount(2);
        result.Items.Should().AllBeOfType<JobListDto>();
    }

    [Fact]
    public async Task GetPublishedJobByIdAsync_WithValidPublishedJob_ReturnsJobDto()
    {
        // Arrange
        var job = TestHelpers.CreateTestJob(1);
        job.Status = JobStatus.Published;

        _jobRepositoryMock.Setup(x => x.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);

        // Act
        var result = await _jobService.GetPublishedJobByIdAsync("1");

        // Assert
        result.Should().NotBeNull();
        result!.Title.Should().Be(job.Title);
        result.Status.Should().Be(JobStatus.Published.ToString());
    }

    [Fact]
    public async Task GetPublishedJobByIdAsync_WithDraftJob_ReturnsNull()
    {
        // Arrange
        var job = TestHelpers.CreateTestJob(1);
        job.Status = JobStatus.Draft;

        _jobRepositoryMock.Setup(x => x.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);

        // Act
        var result = await _jobService.GetPublishedJobByIdAsync("1");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task PublishAsync_WithDraftJob_ReturnsPublishedJob()
    {
        // Arrange
        var userId = 1;
        var employer = TestHelpers.CreateTestEmployer(1, userId);
        var job = TestHelpers.CreateTestJob(1);
        job.Status = JobStatus.Draft;
        job.ApplicationDeadline = DateTime.UtcNow.AddDays(10);

        _employerRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employer);
        _jobRepositoryMock.Setup(x => x.GetByIdForEmployerAsync(1, 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);
        _jobRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _jobRepositoryMock.Setup(x => x.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);

        // Act
        var result = await _jobService.PublishAsync(userId, "1");

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be(JobStatus.Published.ToString());
        job.Status.Should().Be(JobStatus.Published);
    }

    [Fact]
    public async Task PublishAsync_WithPastDeadline_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var employer = TestHelpers.CreateTestEmployer(1, userId);
        var job = TestHelpers.CreateTestJob(1);
        job.Status = JobStatus.Draft;
        job.ApplicationDeadline = DateTime.UtcNow.AddDays(-1);

        _employerRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employer);
        _jobRepositoryMock.Setup(x => x.GetByIdForEmployerAsync(1, 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);

        // Act & Assert
        await _jobService.Invoking(x => x.PublishAsync(userId, "1"))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Application deadline must be in the future*");
    }

    [Fact]
    public async Task CloseAsync_WithPublishedJob_ReturnsClosedJob()
    {
        // Arrange
        var userId = 1;
        var employer = TestHelpers.CreateTestEmployer(1, userId);
        var job = TestHelpers.CreateTestJob(1);
        job.Status = JobStatus.Published;

        _employerRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employer);
        _jobRepositoryMock.Setup(x => x.GetByIdForEmployerAsync(1, 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);
        _jobRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _jobRepositoryMock.Setup(x => x.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);

        // Act
        var result = await _jobService.CloseAsync(userId, "1");

        // Assert
        result.Should().NotBeNull();
        result!.Status.Should().Be(JobStatus.Closed.ToString());
        job.Status.Should().Be(JobStatus.Closed);
    }
}