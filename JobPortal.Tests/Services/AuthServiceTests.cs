using JobPortal.Application.Configuration;
using JobPortal.Application.DTOs.Auth;
using JobPortal.Application.Interfaces;
using JobPortal.Application.Services;
using JobPortal.Domain.Entities;
using JobPortal.Tests.Helpers;
using Microsoft.Extensions.Options;
using Moq;

namespace JobPortal.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly IOptions<JwtSettings> _jwtSettings;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtServiceMock = new Mock<IJwtService>();
        _jwtSettings = TestHelpers.CreateJwtSettings();
        
        _authService = new AuthService(
            _userRepositoryMock.Object,
            _passwordHasherMock.Object,
            _jwtServiceMock.Object,
            _jwtSettings);
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_ReturnsAuthResponse()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "newuser@example.com",
            Password = "Password123!",
            Role = "Candidate"
        };

        var role = new Role { Id = 3, Name = "Candidate" };
        var createdUser = new User { Id = 1, Email = request.Email.ToLowerInvariant(), Role = role };
        
        _userRepositoryMock.Setup(x => x.EmailExistsAsync(request.Email.ToLowerInvariant()))
            .ReturnsAsync(false);
        _userRepositoryMock.Setup(x => x.GetRoleByNameAsync("Candidate"))
            .ReturnsAsync(role);
        _userRepositoryMock.Setup(x => x.AddAsync(It.IsAny<User>()))
            .Callback<User>(u => u.Id = 1)
            .Returns(Task.CompletedTask);
        _userRepositoryMock.Setup(x => x.SaveChangesAsync())
            .Returns(Task.CompletedTask);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(createdUser);

        _passwordHasherMock.Setup(x => x.HashPassword(request.Password))
            .Returns("hashed_password");
        
        _jwtServiceMock.Setup(x => x.GenerateToken(It.IsAny<User>()))
            .Returns("test_jwt_token");

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be("test_jwt_token");
        result.Email.Should().Be(request.Email.ToLowerInvariant());
        result.Role.Should().Be("Candidate");
        result.UserId.Should().Be("1");
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "existing@example.com",
            Password = "Password123!",
            Role = "Candidate"
        };

        _userRepositoryMock.Setup(x => x.EmailExistsAsync(request.Email.ToLowerInvariant()))
            .ReturnsAsync(true);

        // Act & Assert
        await _authService.Invoking(x => x.RegisterAsync(request))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task RegisterAsync_WithAdminRole_ThrowsInvalidOperationException()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "admin@example.com",
            Password = "Password123!",
            Role = "Admin"
        };

        _userRepositoryMock.Setup(x => x.EmailExistsAsync(request.Email.ToLowerInvariant()))
            .ReturnsAsync(false);

        // Act & Assert
        await _authService.Invoking(x => x.RegisterAsync(request))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Admin registration is not allowed*");
    }

    [Fact]
    public async Task RegisterAsync_WithInvalidRole_ThrowsArgumentException()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "user@example.com",
            Password = "Password123!",
            Role = "InvalidRole"
        };

        _userRepositoryMock.Setup(x => x.EmailExistsAsync(request.Email.ToLowerInvariant()))
            .ReturnsAsync(false);

        // Act & Assert
        await _authService.Invoking(x => x.RegisterAsync(request))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Role must be Candidate or Employer*");
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var user = TestHelpers.CreateTestUser();
        _userRepositoryMock.Setup(x => x.GetByEmailWithProfileAsync(request.Email.ToLowerInvariant()))
            .ReturnsAsync(user);
        
        _passwordHasherMock.Setup(x => x.VerifyPassword(request.Password, user.PasswordHash))
            .Returns(true);
        
        _jwtServiceMock.Setup(x => x.GenerateToken(user))
            .Returns("test_jwt_token");

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be("test_jwt_token");
        result.Email.Should().Be(user.Email);
        result.Role.Should().Be("Candidate");
    }

    [Fact]
    public async Task LoginAsync_WithInvalidEmail_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            Email = "nonexistent@example.com",
            Password = "Password123!"
        };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(request.Email.ToLowerInvariant()))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await _authService.Invoking(x => x.LoginAsync(request))
            .Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Invalid email or password*");
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            Email = "test@example.com",
            Password = "WrongPassword"
        };

        var user = TestHelpers.CreateTestUser();
        _userRepositoryMock.Setup(x => x.GetByEmailWithProfileAsync(request.Email.ToLowerInvariant()))
            .ReturnsAsync(user);
        
        _passwordHasherMock.Setup(x => x.VerifyPassword(request.Password, user.PasswordHash))
            .Returns(false);

        // Act & Assert
        await _authService.Invoking(x => x.LoginAsync(request))
            .Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Invalid email or password*");
    }

    [Fact]
    public async Task LoginAsync_WithInactiveUser_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var user = TestHelpers.CreateTestUser();
        user.IsActive = false;
        
        _userRepositoryMock.Setup(x => x.GetByEmailWithProfileAsync(request.Email.ToLowerInvariant()))
            .ReturnsAsync(user);

        // Act & Assert
        await _authService.Invoking(x => x.LoginAsync(request))
            .Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*This account is inactive*");
    }
}