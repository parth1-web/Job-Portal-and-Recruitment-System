using JobPortal.Application.DTOs.Auth;
using JobPortal.Application.DTOs.Employers;
using JobPortal.Tests.Integration;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace JobPortal.Tests.Integration;

public class EmployerControllerIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public EmployerControllerIntegrationTests(TestWebApplicationFactory factory)
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
        var token = await RegisterAndLoginAsync($"employer_profile_{Guid.NewGuid()}@test.com", "Employer");
        SetAuth(token);

        // Act
        var response = await _client.GetAsync("/api/employer/profile");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateProfile_WithValidData_ReturnsCreated()
    {
        // Arrange
        var email = $"employer_create_{Guid.NewGuid()}@test.com";
        var token = await RegisterAndLoginAsync(email, "Employer");
        SetAuth(token);

        var request = new UpdateEmployerProfileDto
        {
            CompanyName = "Tech Solutions Inc",
            CompanyDescription = "Leading tech solutions provider",
            Website = "https://techsolutions.com",
            Industry = "Technology",
            Location = "San Francisco, CA",
            CompanyLogoUrl = "https://techsolutions.com/logo.png"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/employer/profile", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("companyName").GetString().Should().Be(request.CompanyName);
        content.GetProperty("email").GetString().Should().Be(email);
    }

    [Fact]
    public async Task UpdateProfile_WithValidData_ReturnsOk()
    {
        // Arrange
        var email = $"employer_update_{Guid.NewGuid()}@test.com";
        var token = await RegisterAndLoginAsync(email, "Employer");
        SetAuth(token);

        var createRequest = new UpdateEmployerProfileDto
        {
            CompanyName = "Original Company"
        };
        await _client.PostAsJsonAsync("/api/employer/profile", createRequest);

        var updateRequest = new UpdateEmployerProfileDto
        {
            CompanyName = "Updated Company",
            Industry = "FinTech"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/employer/profile", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("companyName").GetString().Should().Be("Updated Company");
        content.GetProperty("industry").GetString().Should().Be("FinTech");
    }

    [Fact]
    public async Task GetProfile_WithCandidateAuth_ReturnsForbidden()
    {
        // Arrange
        var candidateToken = await RegisterAndLoginAsync($"candidate_for_employer_{Guid.NewGuid()}@test.com", "Candidate");
        SetAuth(candidateToken);

        // Act
        var response = await _client.GetAsync("/api/employer/profile");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}