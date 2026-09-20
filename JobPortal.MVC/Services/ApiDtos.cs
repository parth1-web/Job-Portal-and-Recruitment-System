using JobPortal.MVC.Models;

namespace JobPortal.MVC.Services
{
    /// <summary>
    /// Shapes matching the JobPortal.API JSON contract (int ids, numeric enums).
    /// MVC view models use string ids, so responses are mapped through here.
    /// </summary>
    internal sealed class ApiInterviewDto
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string JobTitle { get; set; } = "";
        public string CandidateName { get; set; } = "";
        public DateTime ScheduledAt { get; set; }
        public int DurationMinutes { get; set; }
        public string? MeetingLink { get; set; }
        public string? Notes { get; set; }
        public System.Text.Json.JsonElement? Status { get; set; }
    }

    internal static class ApiMaps
    {
        // API serializes InterviewStatus as a number (Scheduled=1, Completed=2,
        // Cancelled=3, Rescheduled=4); tolerate numeric or string payloads.
        public static string InterviewStatus(System.Text.Json.JsonElement? status)
        {
            if (status == null)
                return "Scheduled";
            var el = status.Value;
            if (el.ValueKind == System.Text.Json.JsonValueKind.Number && el.TryGetInt32(out var n))
            {
                return n switch { 1 => "Scheduled", 2 => "Completed", 3 => "Cancelled", 4 => "Rescheduled", _ => "Scheduled" };
            }
            var text = el.ToString().Trim('"');
            return string.IsNullOrEmpty(text) ? "Scheduled" : text;
        }

        public static InterviewDto ToInterview(ApiInterviewDto i) => new()
        {
            Id = i.Id.ToString(),
            ApplicationId = i.ApplicationId.ToString(),
            JobTitle = i.JobTitle,
            CandidateName = i.CandidateName,
            ScheduledAt = i.ScheduledAt,
            DurationMinutes = i.DurationMinutes,
            Type = "Video",
            Status = InterviewStatus(i.Status),
            MeetingLink = i.MeetingLink,
            Notes = i.Notes
        };
    }
}