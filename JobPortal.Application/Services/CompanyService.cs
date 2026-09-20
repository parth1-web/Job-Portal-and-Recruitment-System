using JobPortal.Application.DTOs.Company;
using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;

namespace JobPortal.Application.Services;

public class CompanyService : ICompanyService
{
    private readonly ICompanyRepository _companyRepository;

    public CompanyService(ICompanyRepository companyRepository)
    {
        _companyRepository = companyRepository;
    }

    public async Task<CompanyDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var company = await _companyRepository.GetByIdAsync(id, cancellationToken);
        return company is null ? null : MapToDto(company);
    }

    public async Task<IReadOnlyList<CompanyDto>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var companies = await _companyRepository.GetAllAsync(cancellationToken);
        return companies.Select(MapToDto).ToList();
    }

    public async Task<CompanyDto> CreateAsync(
        CreateCompanyDto dto,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ArgumentException("Company name is required.");
        }

        var existing = await _companyRepository.GetByNameAsync(dto.Name.Trim(), cancellationToken);
        if (existing is not null)
        {
            throw new InvalidOperationException("A company with this name already exists.");
        }

        var company = new Company
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            WebsiteUrl = dto.WebsiteUrl?.Trim(),
            Location = dto.Location?.Trim(),
            LogoUrl = dto.LogoUrl?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _companyRepository.AddAsync(company, cancellationToken);

        var created = await _companyRepository.GetByIdAsync(company.Id, cancellationToken);
        if (created is null)
        {
            throw new InvalidOperationException("Company could not be retrieved after creation.");
        }

        return MapToDto(created);
    }

    public async Task<CompanyDto?> UpdateAsync(
        int id,
        UpdateCompanyDto dto,
        CancellationToken cancellationToken = default)
    {
        var company = await _companyRepository.GetByIdAsync(id, cancellationToken);
        if (company is null)
        {
            return null;
        }

        if (dto.Name != null)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Company name cannot be empty.");
            }

            var existing = await _companyRepository.GetByNameAsync(dto.Name.Trim(), cancellationToken);
            if (existing is not null && existing.Id != id)
            {
                throw new InvalidOperationException("A company with this name already exists.");
            }

            company.Name = dto.Name.Trim();
        }

        if (dto.Description != null)
        {
            company.Description = dto.Description.Trim();
        }

        if (dto.WebsiteUrl != null)
        {
            company.WebsiteUrl = dto.WebsiteUrl.Trim();
        }

        if (dto.Location != null)
        {
            company.Location = dto.Location.Trim();
        }

        if (dto.LogoUrl != null)
        {
            company.LogoUrl = dto.LogoUrl.Trim();
        }

        company.UpdatedAt = DateTime.UtcNow;

        await _companyRepository.UpdateAsync(company, cancellationToken);

        return MapToDto(company);
    }

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var company = await _companyRepository.GetByIdAsync(id, cancellationToken);
        if (company is null)
        {
            return false;
        }

        await _companyRepository.DeleteAsync(company, cancellationToken);
        return true;
    }

    private static CompanyDto MapToDto(Company company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Description = company.Description,
            WebsiteUrl = company.WebsiteUrl,
            Location = company.Location,
            LogoUrl = company.LogoUrl,
            CreatedAt = company.CreatedAt,
            UpdatedAt = company.UpdatedAt
        };
    }
}