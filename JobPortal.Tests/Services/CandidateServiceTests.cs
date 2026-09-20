using JobPortal.Application.DTOs.Candidates;
using JobPortal.Application.Interfaces;
using JobPortal.Application.Services;
using JobPortal.Domain.Entities;
using JobPortal.Tests.Helpers;
using Moq;

namespace JobPortal.Tests.Services;

public class CandidateServiceTests
{
    private readonly Mock<ICandidateRepository> _candidateRepositoryMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly CandidateService _candidateService;

    public CandidateServiceTests()
    {
        _candidateRepositoryMock = new Mock<ICandidateRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();
        
        _candidateService = new CandidateService(
            _candidateRepositoryMock.Object,
            _userRepositoryMock.Object);
    }

    [Fact]
    public async Task GetProfileAsync_WithExistingProfile_ReturnsCandidateProfileDto()
    {
        // Arrange
        var userId = 1;
        var candidate = TestHelpers.CreateTestCandidate(1, userId);
        var user = TestHelpers.CreateTestUser(userId);

        _candidateRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(candidate);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var result = await _candidateService.GetProfileAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(candidate.Id);
        result.FirstName.Should().Be(candidate.FirstName);
        result.LastName.Should().Be(candidate.LastName);
        result.Email.Should().Be(user.Email);
    }

    [Fact]
    public async Task GetProfileAsync_WithNoProfile_ReturnsNull()
    {
        // Arrange
        var userId = 1;
        _candidateRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Candidate?)null);

        // Act
        var result = await _candidateService.GetProfileAsync(userId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateProfileAsync_WithNoExistingProfile_CreatesAndReturnsProfile()
    {
        // Arrange
        var userId = 1;
        var user = TestHelpers.CreateTestUser(userId);
        var request = new UpdateCandidateProfileDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            PhoneNumber = "+1234567890",
            Location = "Boston, MA",
            ProfessionalTitle = "Full Stack Developer",
            Bio = "Passionate developer",
            ResumeUrl = "https://example.com/resume.pdf"
        };

        _candidateRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Candidate?)null);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _candidateRepositoryMock.Setup(x => x.AddAsync(It.IsAny<Candidate>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _candidateService.CreateProfileAsync(userId, request);

        // Assert
        result.Should().NotBeNull();
        result.FirstName.Should().Be(request.FirstName);
        result.LastName.Should().Be(request.LastName);
        result.Email.Should().Be(user.Email);
    }

    [Fact]
    public async Task CreateProfileAsync_WithExistingProfile_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var existingCandidate = TestHelpers.CreateTestCandidate(1, userId);
        var request = new UpdateCandidateProfileDto
        {
            FirstName = "Jane",
            LastName = "Smith"
        };

        _candidateRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCandidate);

        // Act & Assert
        await _candidateService.Invoking(x => x.CreateProfileAsync(userId, request))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Candidate profile already exists*");
    }

    [Fact]
    public async Task UpdateProfileAsync_WithExistingProfile_UpdatesAndReturnsProfile()
    {
        // Arrange
        var userId = 1;
        var candidate = TestHelpers.CreateTestCandidate(1, userId);
        var user = TestHelpers.CreateTestUser(userId);
        var request = new UpdateCandidateProfileDto
        {
            FirstName = "Updated",
            LastName = "Name",
            PhoneNumber = "+0987654321",
            Location = "Chicago, IL",
            ProfessionalTitle = "Senior Developer",
            Bio = "Updated bio",
            ResumeUrl = "https://example.com/new-resume.pdf"
        };

        _candidateRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(candidate);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _candidateRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Candidate>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _candidateService.UpdateProfileAsync(userId, request);

        // Assert
        result.Should().NotBeNull();
        result.FirstName.Should().Be(request.FirstName);
        result.LastName.Should().Be(request.LastName);
        result.PhoneNumber.Should().Be(request.PhoneNumber);
        result.Location.Should().Be(request.Location);
        candidate.FirstName.Should().Be(request.FirstName);
    }

    [Fact]
    public async Task UpdateProfileAsync_WithNoProfile_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var request = new UpdateCandidateProfileDto
        {
            FirstName = "Jane",
            LastName = "Smith"
        };

        _candidateRepositoryMock.Setup(x => x.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Candidate?)null);

        // Act & Assert
        await _candidateService.Invoking(x => x.UpdateProfileAsync(userId, request))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Candidate profile not found*");
    }
}