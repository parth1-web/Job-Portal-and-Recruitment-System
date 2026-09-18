using JobPortal.Application.DTOs.Notifications;
using JobPortal.Application.DTOs.Common;

namespace JobPortal.Application.Interfaces;

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> GetNotificationsAsync(
        int userId,
        int pageNumber = 1,
        int pageSize = 20,
        bool? unreadOnly = null,
        CancellationToken cancellationToken = default);

    Task<int> GetUnreadCountAsync(
        int userId,
        CancellationToken cancellationToken = default);

    Task<NotificationDto> MarkAsReadAsync(
        int userId,
        int notificationId,
        CancellationToken cancellationToken = default);

    Task MarkAllAsReadAsync(
        int userId,
        CancellationToken cancellationToken = default);
}