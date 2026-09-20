using JobPortal.Application.DTOs.Auth;
using JobPortal.Application.DTOs.Applications;
using JobPortal.Application.DTOs.Jobs;
using JobPortal.Domain.Enums;
using JobPortal.Tests.Integration;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace JobPortal.Tests.Integration;

public class JobApplicationControllerIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;
    private string _employerToken = string.Empty;
    private string _candidateToken = string.Empty;

    public JobApplicationControllerIntegrationTests(TestWebApplicationFactory factory)
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
    public async Task ApplyToJob_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        ClearAuth();
        var request = new CreateJobApplicationDto
        {
            JobId = "1",
            ResumeId = "1",
            CoverLetter = "I am interested"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/candidate/applications", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetMyApplications_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        ClearAuth();

        // Act
        var response = await _client.GetAsync("/api/candidate/applications");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task EmployerGetApplications_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        ClearAuth();

        // Act
        var response = await _client.GetAsync("/api/employer/jobs/1/applications");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}