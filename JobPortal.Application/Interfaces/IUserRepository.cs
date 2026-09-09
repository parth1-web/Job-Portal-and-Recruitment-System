using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);

    Task<User?> GetByIdAsync(int id);

    Task<Role?> GetRoleByNameAsync(string roleName);

    Task AddAsync(User user);

    Task<bool> EmailExistsAsync(string email);

    Task SaveChangesAsync();
}