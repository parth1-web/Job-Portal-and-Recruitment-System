using JobPortal.Application.DTOs.Resumes;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Services;

public class ResumeService : IResumeService
{
    private readonly IResumeRepository _resumeRepository;
    private readonly ICandidateRepository _candidateRepository;

    public ResumeService(
        IResumeRepository resumeRepository,
        ICandidateRepository candidateRepository)
    {
        _resumeRepository = resumeRepository;
        _candidateRepository = candidateRepository;
    }

    public async Task<ResumeDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var resume = await _resumeRepository.GetByIdAsync(id, cancellationToken);
        return resume is null ? null : MapToDto(resume);
    }

    public async Task<IReadOnlyList<ResumeDto>> GetByCandidateIdAsync(
        int candidateId,
        CancellationToken cancellationToken = default)
    {
        var resumes = await _resumeRepository.GetByCandidateIdAsync(candidateId, cancellationToken);
        return resumes.Select(MapToDto).ToList();
    }

    public async Task<ResumeDto> CreateAsync(
        int candidateId,
        CreateResumeDto dto,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _candidateRepository.GetByIdAsync(candidateId, cancellationToken);
        if (candidate is null)
        {
            throw new InvalidOperationException("Candidate not found.");
        }

        if (string.IsNullOrWhiteSpace(dto.FileName))
        {
            throw new ArgumentException("File name is required.");
        }

        if (string.IsNullOrWhiteSpace(dto.FileUrl))
        {
            throw new ArgumentException("File URL is required.");
        }

        if (dto.IsDefault)
        {
            var existingDefault = await _resumeRepository.GetDefaultByCandidateIdAsync(candidateId, cancellationToken);
            if (existingDefault is not null)
            {
                existingDefault.IsDefault = false;
                await _resumeRepository.UpdateAsync(existingDefault, cancellationToken);
            }
        }

        var resume = new Resume
        {
            CandidateId = candidateId,
            FileName = dto.FileName.Trim(),
            FileUrl = dto.FileUrl.Trim(),
            IsDefault = dto.IsDefault,
            UploadedAt = DateTime.UtcNow
        };

        await _resumeRepository.AddAsync(resume, cancellationToken);

        var created = await _resumeRepository.GetByIdAsync(resume.Id, cancellationToken);
        if (created is null)
        {
            throw new InvalidOperationException("Resume could not be retrieved after creation.");
        }

        return MapToDto(created);
    }

    public async Task<ResumeDto?> UpdateAsync(
        int candidateId,
        int resumeId,
        UpdateResumeDto dto,
        CancellationToken cancellationToken = default)
    {
        var resume = await _resumeRepository.GetByIdAsync(resumeId, cancellationToken);
        if (resume is null || resume.CandidateId != candidateId)
        {
            return null;
        }

        if (dto.FileName != null)
        {
            if (string.IsNullOrWhiteSpace(dto.FileName))
            {
                throw new ArgumentException("File name cannot be empty.");
            }
            resume.FileName = dto.FileName.Trim();
        }

        if (dto.FileUrl != null)
        {
            if (string.IsNullOrWhiteSpace(dto.FileUrl))
            {
                throw new ArgumentException("File URL cannot be empty.");
            }
            resume.FileUrl = dto.FileUrl.Trim();
        }

        if (dto.IsDefault.HasValue && dto.IsDefault.Value)
        {
            var existingDefault = await _resumeRepository.GetDefaultByCandidateIdAsync(candidateId, cancellationToken);
            if (existingDefault is not null && existingDefault.Id != resumeId)
            {
                existingDefault.IsDefault = false;
                await _resumeRepository.UpdateAsync(existingDefault, cancellationToken);
            }
            resume.IsDefault = true;
        }
        else if (dto.IsDefault.HasValue)
        {
            resume.IsDefault = dto.IsDefault.Value;
        }

        resume.UpdatedAt = DateTime.UtcNow;

        await _resumeRepository.UpdateAsync(resume, cancellationToken);

        return MapToDto(resume);
    }

    public async Task<bool> DeleteAsync(
        int candidateId,
        int resumeId,
        CancellationToken cancellationToken = default)
    {
        var resume = await _resumeRepository.GetByIdAsync(resumeId, cancellationToken);
        if (resume is null || resume.CandidateId != candidateId)
        {
            return false;
        }

        await _resumeRepository.DeleteAsync(resume, cancellationToken);
        return true;
    }

    private static ResumeDto MapToDto(Resume resume)
    {
        return new ResumeDto
        {
            Id = resume.Id,
            CandidateId = resume.CandidateId,
            FileName = resume.FileName,
            FileUrl = resume.FileUrl,
            IsDefault = resume.IsDefault,
            UploadedAt = resume.UploadedAt,
            CreatedAt = resume.CreatedAt,
            UpdatedAt = resume.UpdatedAt
        };
    }
}