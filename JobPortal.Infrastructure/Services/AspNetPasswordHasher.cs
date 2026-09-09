using JobPortal.Application.Interfaces;
using JobPortal.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace JobPortal.Infrastructure.Services;

public class AspNetPasswordHasher : IPasswordHasher
{
    private readonly Microsoft.AspNetCore.Identity.IPasswordHasher<User>
        _passwordHasher;

    public AspNetPasswordHasher(
        Microsoft.AspNetCore.Identity.IPasswordHasher<User> passwordHasher)
    {
        _passwordHasher = passwordHasher;
    }

    public string HashPassword(string password)
    {
        var user = new User();

        return _passwordHasher.HashPassword(user, password);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        var user = new User();

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            passwordHash,
            password);

        return result == PasswordVerificationResult.Success ||
               result == PasswordVerificationResult.SuccessRehashNeeded;
    }
}