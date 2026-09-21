using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using JobPortal.MVC.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace JobPortal.MVC.Services
{
    public class ApiService : IApiService
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<ApiService> _logger;
        private const string TokenSessionKey = "AuthToken";

        public ApiService(HttpClient httpClient, IHttpContextAccessor httpContextAccessor, ILogger<ApiService> logger)
        {
            _httpClient = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;

            var token = GetTokenFromSession();
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }

        public async Task<T?> GetAsync<T>(string endpoint, CancellationToken cancellationToken = default)
        {
            try
            {
                await EnsureAuthHeaderAsync();
                var response = await _httpClient.GetAsync(endpoint, cancellationToken);
                return await HandleResponse<T>(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling GET {Endpoint}", endpoint);
                throw;
            }
        }

        public async Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest data, CancellationToken cancellationToken = default)
        {
            try
            {
                await EnsureAuthHeaderAsync();
                var response = await _httpClient.PostAsJsonAsync(endpoint, data, cancellationToken);
                return await HandleResponse<TResponse>(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling POST {Endpoint}", endpoint);
                throw;
            }
        }

        public async Task<TResponse?> PutAsync<TRequest, TResponse>(string endpoint, TRequest data, CancellationToken cancellationToken = default)
        {
            try
            {
                await EnsureAuthHeaderAsync();
                var response = await _httpClient.PutAsJsonAsync(endpoint, data, cancellationToken);
                return await HandleResponse<TResponse>(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling PUT {Endpoint}", endpoint);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string endpoint, CancellationToken cancellationToken = default)
        {
            try
            {
                await EnsureAuthHeaderAsync();
                var response = await _httpClient.DeleteAsync(endpoint, cancellationToken);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling DELETE {Endpoint}", endpoint);
                throw;
            }
        }

        public async Task<PagedResult<T>?> GetPagedAsync<T>(string endpoint, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
        {
            var separator = endpoint.Contains('?') ? '&' : '?';
            var pagedEndpoint = $"{endpoint}{separator}page={page}&pageSize={pageSize}";
            return await GetAsync<PagedResult<T>>(pagedEndpoint, cancellationToken);
        }

        public void SetAuthToken(string token)
        {
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            SaveTokenToSession(token);
        }

        public void ClearAuthToken()
        {
            _httpClient.DefaultRequestHeaders.Authorization = null;
            ClearTokenFromSession();
        }

        private async Task EnsureAuthHeaderAsync()
        {
            if (_httpClient.DefaultRequestHeaders.Authorization == null)
            {
                var token = GetTokenFromSession();
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }
            }
        }

        private async Task<T?> HandleResponse<T>(HttpResponseMessage response)
        {
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                ClearAuthToken();
                var context = _httpContextAccessor.HttpContext;
                var isAjax = context != null &&
                    string.Equals(context.Request.Headers["X-Requested-With"], "XMLHttpRequest", StringComparison.OrdinalIgnoreCase);
                if (isAjax || context == null)
                {
                    // Let MVC JSON actions translate this into a 401 the
                    // JavaScript can react to (redirect to login).
                    throw new ApiException((int)response.StatusCode, await response.Content.ReadAsStringAsync());
                }
                context.Response.Redirect("/Auth/Login?returnUrl=" + Uri.EscapeDataString(context.Request.Path + context.Request.QueryString));
                return default;
            }

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("API Error: {StatusCode} - {Content}", response.StatusCode, errorContent);
                throw new ApiException((int)response.StatusCode, errorContent);
            }

            if (response.StatusCode == HttpStatusCode.NoContent)
            {
                return default;
            }

            var content = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(content))
            {
                return default;
            }

            try
            {
                return JsonSerializer.Deserialize<T>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to deserialize response: {Content}", content);
                throw;
            }
        }

        private string? GetTokenFromSession()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context?.Session != null)
            {
                return context.Session.GetString(TokenSessionKey);
            }
            return null;
        }

        private void SaveTokenToSession(string token)
        {
            var context = _httpContextAccessor.HttpContext;
            context?.Session?.SetString(TokenSessionKey, token);
        }

        private void ClearTokenFromSession()
        {
            var context = _httpContextAccessor.HttpContext;
            context?.Session?.Remove(TokenSessionKey);
        }
    }

    public class ApiException : Exception
    {
        public int StatusCode { get; }
        public string ResponseContent { get; }

        public ApiException(int statusCode, string responseContent) : base($"API request failed with status code {statusCode}")
        {
            StatusCode = statusCode;
            ResponseContent = responseContent;
        }

        /// <summary>
        /// Extracts the { message } payload the API returns on errors, if present.
        /// </summary>
        public string? GetServerMessage()
        {
            if (string.IsNullOrWhiteSpace(ResponseContent))
                return null;
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(ResponseContent);
                if (doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object &&
                    doc.RootElement.TryGetProperty("message", out var message) &&
                    message.ValueKind == System.Text.Json.JsonValueKind.String)
                {
                    var text = message.GetString();
                    return string.IsNullOrWhiteSpace(text) ? null : text;
                }
            }
            catch (System.Text.Json.JsonException)
            {
                // Not a JSON error body; fall back to the generic message.
            }
            return null;
        }
    }
}