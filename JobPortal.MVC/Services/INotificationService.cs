using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    public interface INotificationService
    {
        Task<PagedResult<NotificationDto>?> GetNotificationsAsync(int page = 1, int pageSize = 20, bool unreadOnly = false);
        Task<int> GetUnreadCountAsync();
        Task<bool> MarkAsReadAsync(string notificationId);
        Task<bool> MarkAllAsReadAsync();
    }
}