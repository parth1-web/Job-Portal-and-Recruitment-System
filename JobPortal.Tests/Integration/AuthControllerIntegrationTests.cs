using JobPortal.Application.DTOs.Auth;
using JobPortal.Tests.Integration;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace JobPortal.Tests.Integration;

public class AuthControllerIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public AuthControllerIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidCandidateData_ReturnsCreated()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "candidate@test.com",
            Password = "Password123!",
            Role = "Candidate"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("token").GetString().Should().NotBeNullOrEmpty();
        content.GetProperty("email").GetString().Should().Be(request.Email);
        content.GetProperty("role").GetString().Should().Be("Candidate");
    }

    [Fact]
    public async Task Register_WithValidEmployerData_ReturnsCreated()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "employer@test.com",
            Password = "Password123!",
            Role = "Employer"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("token").GetString().Should().NotBeNullOrEmpty();
        content.GetProperty("role").GetString().Should().Be("Employer");
    }

    [Fact]
    public async Task Register_WithExistingEmail_ReturnsConflict()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "duplicate@test.com",
            Password = "Password123!",
            Role = "Candidate"
        };

        // Register first user
        await _client.PostAsJsonAsync("/api/auth/register", request);

        // Try to register with same email
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Register_WithAdminRole_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "admin@test.com",
            Password = "Password123!",
            Role = "Admin"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithInvalidRole_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "invalid@test.com",
            Password = "Password123!",
            Role = "InvalidRole"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithMissingEmail_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "",
            Password = "Password123!",
            Role = "Candidate"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOk()
    {
        // Arrange - First register a user
        var registerRequest = new RegisterRequestDto
        {
            Email = "login@test.com",
            Password = "Password123!",
            Role = "Candidate"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequestDto
        {
            Email = "login@test.com",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("token").GetString().Should().NotBeNullOrEmpty();
        content.GetProperty("email").GetString().Should().Be(loginRequest.Email);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange - First register a user
        var registerRequest = new RegisterRequestDto
        {
            Email = "login2@test.com",
            Password = "Password123!",
            Role = "Candidate"
        };
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequestDto
        {
            Email = "login2@test.com",
            Password = "WrongPassword"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ReturnsUnauthorized()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            Email = "nonexistent@test.com",
            Password = "Password123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}