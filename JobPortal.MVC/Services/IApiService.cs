using System.Net.Http.Json;

namespace JobPortal.MVC.Services;

public interface IApiService
{
    Task<T?> GetAsync<T>(string endpoint, CancellationToken cancellationToken = default);
    Task<T?> PostAsync<T>(string endpoint, object data, CancellationToken cancellationToken = default);
    Task<T?> PutAsync<T>(string endpoint, object data, CancellationToken cancellationToken = default);
    Task DeleteAsync(string endpoint, CancellationToken cancellationToken = default);
    void SetAuthToken(string token);
}