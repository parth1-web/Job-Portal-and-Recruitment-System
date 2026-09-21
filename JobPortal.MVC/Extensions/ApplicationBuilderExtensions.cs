using Microsoft.AspNetCore.Builder;

namespace JobPortal.MVC.Extensions
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseCustomExceptionHandler(this IApplicationBuilder app)
        {
            return app.UseMiddleware<JobPortal.MVC.Middleware.ExceptionHandlingMiddleware>();
        }
    }
}