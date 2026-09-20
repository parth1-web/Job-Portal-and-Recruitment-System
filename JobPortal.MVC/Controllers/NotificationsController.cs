using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.MVC.Models;
using JobPortal.MVC.Services;

namespace JobPortal.MVC.Controllers
{
    [Authorize]
    public class NotificationsController : Controller
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            INotificationService notificationService,
            ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<IActionResult> Index(int page = 1, bool unread = false)
        {
            try
            {
                var notifications = await _notificationService.GetNotificationsAsync(page, 20, unread);

                ViewData["Title"] = "Notifications";
                ViewData["PageTitle"] = "Notifications";
                ViewData["UserRole"] = User.FindFirst("role")?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                ViewData["CurrentPage"] = page;
                ViewData["UnreadOnly"] = unread;

                return View(notifications ?? new PagedResult<NotificationDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading notifications");
                return View(new PagedResult<NotificationDto>());
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MarkRead(string id)
        {
            var ok = await _notificationService.MarkAsReadAsync(id);
            return Json(new { success = ok });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MarkAllRead()
        {
            var ok = await _notificationService.MarkAllAsReadAsync();
            return Json(new { success = ok });
        }

        [HttpGet]
        public async Task<IActionResult> UnreadCount()
        {
            var count = await _notificationService.GetUnreadCountAsync();
            return Json(new { count });
        }
    }
}