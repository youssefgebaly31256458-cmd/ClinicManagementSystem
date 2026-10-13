using ClinicManagementSystem.DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;
using ClinicManagementSystem.Business.DTOs.AuthenticationDTOs;

namespace ClinicManagementSystem.Business.Services
{
    public class AuthenticationService
    {
        private readonly ClinicDbContext _context;
        private readonly JwtService _jwtService;

        public AuthenticationService(
            ClinicDbContext context,
            JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public User? GetUserByEmail(string email)
        {
            return _context.Users.Include(u => u.Employee)
                .Include(u => u.Role)
                .FirstOrDefault(u => u.Employee.Email == email);
        }

        public bool VerifyPassword(User user, string Password)
        {
            return BCrypt.Net.BCrypt.Verify(Password, user.HashedPassword);
        }


        public bool ChangePassword(int UserId, string CurrentPassword, string NewPassword)
        {
            User? user = _context.Users.Find(UserId);
            if (user == null)
            {
                return false;
            }
            bool isCurrentPasswordCorrect = BCrypt.Net.BCrypt.Verify(CurrentPassword, user.HashedPassword);
            if (!isCurrentPasswordCorrect)
            {
                return false;

            }
            user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(NewPassword);
            _context.SaveChanges();
            return true;
        }

        public AuthenticationResultDTO? Login(string Email, string Password)
        {
            User? user = GetUserByEmail(Email);

            if (user == null)
                return null;

            if (!user.IsActive)
                return null;

            if (!VerifyPassword(user, Password))
                return null;

            string Token = _jwtService.GenerateToken(user);

            string RefreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = RefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            _context.SaveChanges();

            return new AuthenticationResultDTO
            {
                User = user,
                Token = Token,
                RefreshToken = RefreshToken
            };
        }

        public User? GetUserByRefreshToken(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return null;

            return _context.Users.Include(u => u.Employee)
                .Include(u => u.Role)
                .FirstOrDefault(u => u.RefreshToken == refreshToken);
        }

        public AuthenticationResultDTO? RefreshToken(string refreshToken)
        {
            User? user = GetUserByRefreshToken(refreshToken);

            if (user == null)
                return null;

            if (!user.IsActive)
                return null;

            if (user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                return null;

            string newAccessToken = _jwtService.GenerateToken(user);
            string newRefreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            _context.SaveChanges();

            return new AuthenticationResultDTO
            {
                User = user,
                Token = newAccessToken,
                RefreshToken = newRefreshToken
            };
        }

        public bool Logout(string refreshToken)
        {
            User? user = GetUserByRefreshToken(refreshToken);

            if (user == null)
                return false;

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;

            _context.SaveChanges();
            return true;
        }

    }
}
