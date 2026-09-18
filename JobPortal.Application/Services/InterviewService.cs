using JobPortal.Application.DTOs.Interviews;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using JobPortal.Domain.Enums;

namespace JobPortal.Application.Services;

public class InterviewService : IInterviewService
{
    private readonly IInterviewRepository _interviewRepository;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICandidateRepository _candidateRepository;

    public InterviewService(
        IInterviewRepository interviewRepository,
        IJobApplicationRepository applicationRepository,
        IUserRepository userRepository,
        ICandidateRepository candidateRepository)
    {
        _interviewRepository = interviewRepository;
        _applicationRepository = applicationRepository;
        _userRepository = userRepository;
        _candidateRepository = candidateRepository;
    }

    public async Task<InterviewDto> ScheduleAsync(
        int userId,
        CreateInterviewDto dto,
        CancellationToken cancellationToken = default)
    {
        var application = await _applicationRepository.GetByIdWithDetailsAsync(dto.ApplicationId, cancellationToken);
        if (application is null)
        {
            throw new InvalidOperationException("Application not found.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            throw new InvalidOperationException("User not found.");
        }

        var isEmployer = application.Job.Employer.UserId == userId;
        var isAdmin = user.Role.Name == "Admin";

        if (!isEmployer && !isAdmin)
        {
            throw new UnauthorizedAccessException("Not authorized to schedule interviews for this application.");
        }

        if (application.Status == ApplicationStatus.Rejected || application.Status == ApplicationStatus.Withdrawn)
        {
            throw new InvalidOperationException("Cannot schedule interview for rejected or withdrawn application.");
        }

        if (dto.ScheduledAt <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Interview must be scheduled in the future.");
        }

        if (dto.DurationMinutes <= 0)
        {
            throw new InvalidOperationException("Duration must be greater than 0.");
        }

        var interview = new Interview
        {
            ApplicationId = dto.ApplicationId,
            ScheduledAt = dto.ScheduledAt,
            DurationMinutes = dto.DurationMinutes,
            MeetingLink = dto.MeetingLink?.Trim(),
            Notes = dto.Notes?.Trim(),
            Status = InterviewStatus.Scheduled
        };

        await _interviewRepository.AddAsync(interview, cancellationToken);

        var created = await _interviewRepository.GetByIdAsync(interview.Id, cancellationToken);
        if (created is null)
        {
            throw new InvalidOperationException("Interview could not be retrieved after creation.");
        }

        return MapToDto(created);
    }

    public async Task<IReadOnlyList<InterviewDto>> GetByApplicationIdAsync(
        int applicationId,
        CancellationToken cancellationToken = default)
    {
        var interviews = await _interviewRepository.GetByApplicationIdAsync(applicationId, cancellationToken);
        return interviews.Select(MapToDto).ToList();
    }

    public async Task<InterviewDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var interview = await _interviewRepository.GetByIdAsync(id, cancellationToken);
        return interview is null ? null : MapToDto(interview);
    }

    public async Task<InterviewDto?> UpdateAsync(
        int userId,
        int interviewId,
        UpdateInterviewDto dto,
        CancellationToken cancellationToken = default)
    {
        var interview = await _interviewRepository.GetByIdAsync(interviewId, cancellationToken);
        if (interview is null)
        {
            return null;
        }

        var application = await _applicationRepository.GetByIdWithDetailsAsync(interview.ApplicationId, cancellationToken);
        if (application is null)
        {
            return null;
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            return null;
        }

        var isEmployer = application.Job.Employer.UserId == userId;
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        var isCandidate = candidate is not null && application.CandidateId == candidate.Id;
        var isAdmin = user.Role.Name == "Admin";

        if (!isEmployer && !isCandidate && !isAdmin)
        {
            throw new UnauthorizedAccessException("Not authorized to update this interview.");
        }

        if (dto.ScheduledAt.HasValue && dto.ScheduledAt.Value <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Interview must be scheduled in the future.");
        }

        if (dto.DurationMinutes.HasValue && dto.DurationMinutes.Value <= 0)
        {
            throw new InvalidOperationException("Duration must be greater than 0.");
        }

        if (dto.ScheduledAt.HasValue)
        {
            interview.ScheduledAt = dto.ScheduledAt.Value;
        }

        if (dto.DurationMinutes.HasValue)
        {
            interview.DurationMinutes = dto.DurationMinutes.Value;
        }

        if (dto.MeetingLink != null)
        {
            interview.MeetingLink = dto.MeetingLink.Trim();
        }

        if (dto.Notes != null)
        {
            interview.Notes = dto.Notes.Trim();
        }

        if (dto.Status.HasValue)
        {
            interview.Status = dto.Status.Value;
        }

        interview.UpdatedAt = DateTime.UtcNow;

        await _interviewRepository.UpdateAsync(interview, cancellationToken);

        var updated = await _interviewRepository.GetByIdAsync(interviewId, cancellationToken);
        return updated is null ? null : MapToDto(updated);
    }

    public async Task CancelAsync(
        int userId,
        int interviewId,
        CancellationToken cancellationToken = default)
    {
        var interview = await _interviewRepository.GetByIdAsync(interviewId, cancellationToken);
        if (interview is null)
        {
            throw new InvalidOperationException("Interview not found.");
        }

        var application = await _applicationRepository.GetByIdWithDetailsAsync(interview.ApplicationId, cancellationToken);
        if (application is null)
        {
            throw new InvalidOperationException("Application not found.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            throw new InvalidOperationException("User not found.");
        }

        var isEmployer = application.Job.Employer.UserId == userId;
        var candidate = await _candidateRepository.GetByUserIdAsync(userId, cancellationToken);
        var isCandidate = candidate is not null && application.CandidateId == candidate.Id;
        var isAdmin = user.Role.Name == "Admin";

        if (!isEmployer && !isCandidate && !isAdmin)
        {
            throw new UnauthorizedAccessException("Not authorized to cancel this interview.");
        }

        if (interview.Status == InterviewStatus.Cancelled)
        {
            throw new InvalidOperationException("Interview is already cancelled.");
        }

        interview.Status = InterviewStatus.Cancelled;
        interview.UpdatedAt = DateTime.UtcNow;

        await _interviewRepository.UpdateAsync(interview, cancellationToken);
    }

    private static InterviewDto MapToDto(Interview interview)
    {
        return new InterviewDto
        {
            Id = interview.Id,
            ApplicationId = interview.ApplicationId,
            JobTitle = interview.Application.Job.Title,
            CandidateName = $"{interview.Application.Candidate.FirstName} {interview.Application.Candidate.LastName}",
            ScheduledAt = interview.ScheduledAt,
            DurationMinutes = interview.DurationMinutes,
            MeetingLink = interview.MeetingLink,
            Notes = interview.Notes,
            Status = interview.Status,
            CreatedAt = interview.CreatedAt,
            UpdatedAt = interview.UpdatedAt
        };
    }
}