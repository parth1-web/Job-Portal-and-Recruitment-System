using JobPortal.Application.DTOs.Auth;
using JobPortal.Application.DTOs.Employers;
using JobPortal.Application.DTOs.Jobs;
using JobPortal.Domain.Enums;
using JobPortal.Tests.Integration;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace JobPortal.Tests.Integration;

public class JobControllerIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public JobControllerIntegrationTests(TestWebApplicationFactory factory)
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

    private async Task CreateEmployerProfileAsync(string token)
    {
        _client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        
        var profileRequest = new UpdateEmployerProfileDto
        {
            CompanyName = "Test Company",
            CompanyDescription = "Test Description",
            Website = "https://test.com",
            Industry = "Technology",
            Location = "Test City",
            CompanyLogoUrl = "https://test.com/logo.png"
        };
        
        await _client.PostAsJsonAsync("/api/employer/profile", profileRequest);
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
    public async Task GetPublishedJobs_WithoutAuth_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/jobs");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetPublishedJobById_WithNonExistentId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/jobs/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task EmployerCreateJob_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var request = new CreateJobDto
        {
            CompanyId = "1",
            CategoryId = "1",
            Title = "Test Job",
            Description = "Test Description",
            ApplicationDeadline = DateTime.UtcNow.AddDays(30)
        };

        ClearAuth();

        // Act
        var response = await _client.PostAsJsonAsync("/api/employer/jobs", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task EmployerCreateJob_WithCandidateAuth_ReturnsForbidden()
    {
        // Arrange
        var candidateToken = await RegisterAndLoginAsync($"candidate_{Guid.NewGuid()}@test.com", "Candidate");
        SetAuth(candidateToken);

        var request = new CreateJobDto
        {
            CompanyId = "1",
            CategoryId = "1",
            Title = "Test Job",
            Description = "Test Description",
            ApplicationDeadline = DateTime.UtcNow.AddDays(30)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/employer/jobs", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task EmployerGetJobs_WithProfile_ReturnsEmptyList()
    {
        // Arrange
        var employerToken = await RegisterAndLoginAsync($"employer_{Guid.NewGuid()}@test.com", "Employer");
        await CreateEmployerProfileAsync(employerToken);
        SetAuth(employerToken);

        // Act
        var response = await _client.GetAsync("/api/employer/jobs");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var jobs = await response.Content.ReadFromJsonAsync<List<JobListDto>>();
        jobs.Should().NotBeNull();
        jobs.Should().BeEmpty();
    }
}