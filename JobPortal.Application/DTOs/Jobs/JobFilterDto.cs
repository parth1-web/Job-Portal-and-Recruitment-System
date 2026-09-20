namespace JobPortal.Application.DTOs.Jobs;

public class JobFilterDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public string? Location { get; set; }
    public string? WorkMode { get; set; }
    public string? EmploymentType { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public List<string> SkillIds { get; set; } = new();
    public string? CompanyId { get; set; }
    public string? Status { get; set; }
    public string SortBy { get; set; } = "PostedDate";
    public string SortDirection { get; set; } = "desc";
}