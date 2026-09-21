using JobPortal.Application.DTOs.Company;

namespace JobPortal.Application.Interfaces;

public interface ICompanyService
{
    Task<CompanyDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CompanyDto>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<CompanyDto> CreateAsync(
        CreateCompanyDto dto,
        CancellationToken cancellationToken = default);

    Task<CompanyDto?> UpdateAsync(
        int id,
        UpdateCompanyDto dto,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}