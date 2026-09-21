using JobPortal.Domain.Entities;

namespace JobPortal.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}