using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IApiService _apiService;

        public NotificationService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<PagedResult<NotificationDto>?> GetNotificationsAsync(int page = 1, int pageSize = 20, bool unreadOnly = false)
        {
            // API paging parameter is named pageNumber.
            var endpoint = $"api/notifications?pageNumber={page}&pageSize={pageSize}";
            if (unreadOnly)
                endpoint += "&unreadOnly=true";
            var result = await _apiService.GetAsync<PagedResult<ApiNotificationDto>>(endpoint);
            if (result == null)
                return new PagedResult<NotificationDto>();
            return new PagedResult<NotificationDto>
            {
                Items = result.Items.Select(Map).ToList(),
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }

        public async Task<int> GetUnreadCountAsync()
        {
            // API returns { unreadCount }.
            var result = await _apiService.GetAsync<UnreadCountResponse>("api/notifications/unread-count");
            return result?.UnreadCount ?? 0;
        }

        public async Task<bool> MarkAsReadAsync(string notificationId)
        {
            if (!int.TryParse(notificationId, out var id))
                return false;
            try
            {
                await _apiService.PutAsync<object, NotificationDto>($"api/notifications/{id}/read", new { });
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> MarkAllAsReadAsync()
        {
            try
            {
                // API answers 204 NoContent; PutAsync returns default without throwing.
                await _apiService.PutAsync<object, object>("api/notifications/read-all", new { });
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static NotificationDto Map(ApiNotificationDto n) => new()
        {
            Id = n.Id.ToString(),
            Title = n.Title,
            Message = n.Message,
            Type = n.IsRead ? "info" : "primary",
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        };

        private sealed class ApiNotificationDto
        {
            public int Id { get; set; }
            public string Title { get; set; } = "";
            public string Message { get; set; } = "";
            public bool IsRead { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        private sealed class UnreadCountResponse
        {
            public int UnreadCount { get; set; }
        }
    }
}