using JobPortal.Application.DTOs.Employers;
using JobPortal.Application.Interfaces;
using JobPortal.Application.Services;
using JobPortal.Domain.Entities;
using JobPortal.Tests.Helpers;
using Moq;

namespace JobPortal.Tests.Services;

public class EmployerServiceTests
{
    private readonly Mock<IEmployerRepository> _employerRepositoryMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly EmployerService _employerService;

    public EmployerServiceTests()
    {
        _employerRepositoryMock = new Mock<IEmployerRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();
        
        _employerService = new EmployerService(
            _employerRepositoryMock.Object,
            _userRepositoryMock.Object);
    }

    [Fact]
    public async Task GetProfileAsync_WithExistingProfile_ReturnsEmployerProfileDto()
    {
        // Arrange
        var userId = 2;
        var employer = TestHelpers.CreateTestEmployer(1, userId);
        var user = TestHelpers.CreateTestUser(userId, "employer@example.com", "Employer");

        _employerRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employer);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _employerService.GetProfileAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(employer.Id);
        result.CompanyName.Should().Be(employer.CompanyName);
        result.Email.Should().Be(user.Email);
    }

    [Fact]
    public async Task CreateProfileAsync_WithNoExistingProfile_CreatesAndReturnsProfile()
    {
        // Arrange
        var userId = 2;
        var user = TestHelpers.CreateTestUser(userId, "employer@example.com", "Employer");
        var request = new UpdateEmployerProfileDto
        {
            CompanyName = "New Tech Corp",
            CompanyDescription = "Innovative technology solutions",
            Website = "https://newtech.com",
            Industry = "Software",
            Location = "Austin, TX",
            CompanyLogoUrl = "https://newtech.com/logo.png"
        };

        _employerRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Employer?)null);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _employerRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Employer>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _employerService.CreateProfileAsync(userId, request);

        // Assert
        result.Should().NotBeNull();
        result.CompanyName.Should().Be(request.CompanyName);
        result.Email.Should().Be(user.Email);
    }

    [Fact]
    public async Task CreateProfileAsync_WithExistingProfile_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 2;
        var existingEmployer = TestHelpers.CreateTestEmployer(1, userId);
        var request = new UpdateEmployerProfileDto
        {
            CompanyName = "Another Company"
        };

        _employerRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingEmployer);

        // Act & Assert
        await _employerService.Invoking(x => x.CreateProfileAsync(userId, request))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Employer profile already exists*");
    }

    [Fact]
    public async Task UpdateProfileAsync_WithExistingProfile_UpdatesAndReturnsProfile()
    {
        // Arrange
        var userId = 2;
        var employer = TestHelpers.CreateTestEmployer(1, userId);
        var user = TestHelpers.CreateTestUser(userId, "employer@example.com", "Employer");
        var request = new UpdateEmployerProfileDto
        {
            CompanyName = "Updated Tech Corp",
            CompanyDescription = "Updated description",
            Website = "https://updated.com",
            Industry = "AI/ML",
            Location = "Seattle, WA",
            CompanyLogoUrl = "https://updated.com/logo.png"
        };

        _employerRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employer);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _employerRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Employer>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _employerService.UpdateProfileAsync(userId, request);

        // Assert
        result.Should().NotBeNull();
        result.CompanyName.Should().Be(request.CompanyName);
        result.Industry.Should().Be(request.Industry);
        employer.CompanyName.Should().Be(request.CompanyName);
    }
}