using JobPortal.Application.DTOs.Auth;
using JobPortal.Application.DTOs.Candidates;
using JobPortal.Tests.Integration;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace JobPortal.Tests.Integration;

public class CandidateControllerIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public CandidateControllerIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterAndLoginAsync(string email, string role)
    {
        var registerRequest = new RegisterRequestDto
        {
            Email = email,
            Password = "Password123!",
            Role = role
        };
        
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        registerResponse.EnsureSuccessStatusCode();
        
        var registerContent = await registerResponse.Content.ReadFromJsonAsync<JsonElement>();
        return registerContent.GetProperty("token").GetString() ?? string.Empty;
    }

    private void SetAuth(string token)
    {
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    private void ClearAuth()
    {
        _client.DefaultRequestHeaders.Authorization = null;
    }

    [Fact]
    public async Task GetProfile_WithoutProfile_ReturnsNotFound()
    {
        // Arrange
        var token = await RegisterAndLoginAsync($"candidate_profile_{Guid.NewGuid()}@test.com", "Candidate");
        SetAuth(token);

        // Act
        var response = await _client.GetAsync("/api/candidate/profile");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateProfile_WithValidData_ReturnsCreated()
    {
        // Arrange
        var email = $"candidate_create_{Guid.NewGuid()}@test.com";
        var token = await RegisterAndLoginAsync(email, "Candidate");
        SetAuth(token);

        var request = new UpdateCandidateProfileDto
        {
            FirstName = "John",
            LastName = "Doe",
            PhoneNumber = "+1234567890",
            Location = "New York, NY",
            ProfessionalTitle = "Software Engineer",
            Bio = "Experienced developer",
            ResumeUrl = "https://example.com/resume.pdf"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/candidate/profile", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("firstName").GetString().Should().Be(request.FirstName);
        content.GetProperty("lastName").GetString().Should().Be(request.LastName);
        content.GetProperty("email").GetString().Should().Be(email);
    }

    [Fact]
    public async Task CreateProfile_Duplicate_ReturnsConflict()
    {
        // Arrange
        var email = $"candidate_dup_{Guid.NewGuid()}@test.com";
        var token = await RegisterAndLoginAsync(email, "Candidate");
        SetAuth(token);

        var request = new UpdateCandidateProfileDto
        {
            FirstName = "John",
            LastName = "Doe"
        };

        // Create first profile
        await _client.PostAsJsonAsync("/api/candidate/profile", request);

        // Try to create again
        var response = await _client.PostAsJsonAsync("/api/candidate/profile", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task UpdateProfile_WithValidData_ReturnsOk()
    {
        // Arrange
        var email = $"candidate_update_{Guid.NewGuid()}@test.com";
        var token = await RegisterAndLoginAsync(email, "Candidate");
        SetAuth(token);

        var createRequest = new UpdateCandidateProfileDto
        {
            FirstName = "John",
            LastName = "Doe"
        };
        await _client.PostAsJsonAsync("/api/candidate/profile", createRequest);

        var updateRequest = new UpdateCandidateProfileDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            Location = "Boston, MA"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/candidate/profile", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("firstName").GetString().Should().Be("Jane");
        content.GetProperty("lastName").GetString().Should().Be("Smith");
        content.GetProperty("location").GetString().Should().Be("Boston, MA");
    }

    [Fact]
    public async Task GetProfile_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        ClearAuth();

        // Act
        var response = await _client.GetAsync("/api/candidate/profile");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}