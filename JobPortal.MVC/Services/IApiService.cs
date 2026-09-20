using System.Net.Http.Json;
using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    public interface IApiService
    {
        Task<T?> GetAsync<T>(string endpoint, CancellationToken cancellationToken = default);
        Task<TResponse?> PostAsync<TRequest, TResponse>(string endpoint, TRequest data, CancellationToken cancellationToken = default);
        Task<TResponse?> PutAsync<TRequest, TResponse>(string endpoint, TRequest data, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(string endpoint, CancellationToken cancellationToken = default);
        Task<PagedResult<T>?> GetPagedAsync<T>(string endpoint, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);
        void SetAuthToken(string token);
        void ClearAuthToken();
    }
}