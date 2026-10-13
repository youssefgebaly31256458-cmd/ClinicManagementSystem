using ClinicManagementSystem.Business.DTOs.UserDTOs;
using ClinicManagementSystem.DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClinicManagementSystem.Business.Helpers;
using Microsoft.EntityFrameworkCore;
namespace ClinicManagementSystem.Business.Services
{
    public class UserService
    {
        private readonly ClinicDbContext _context;

        public UserService(ClinicDbContext context)
        {
            _context = context;
        }

        public List<UserDTO> GetAll()
        {
            List<UserDTO> users = _context.Users
                .Select(u => new UserDTO
                {
                    UserId = u.UserId,
                    EmployeeId = u.EmployeeId,
                    EmployeeName = u.Employee.Name,
                    RoleId = u.RoleId,
                    RoleName = u.Role.RoleName,
                    Username = u.UserName,
                    IsActive = u.IsActive
                })
                .ToList();

            return users;
        }

        public UserDTO? GetById(int id)
        {
            UserDTO? user = _context.Users
                .Where(u => u.UserId == id)
                .Select(u => new UserDTO
                {
                    UserId = u.UserId,
                    EmployeeId = u.EmployeeId,
                    EmployeeName = u.Employee.Name,
                    RoleId = u.RoleId,
                    RoleName = u.Role.RoleName,
                    Username = u.UserName,
                    IsActive = u.IsActive
                })
                .FirstOrDefault();

            return user;
        }

        public int Add(AddUserDTO dto)
        {
            bool employeeExists = _context.Employees
                .Any(e => e.EmployeeId == dto.EmployeeId);

            bool roleExists = _context.Roles
                .Any(r => r.RoleId == dto.RoleId);

            bool usernameExists = _context.Users
                .Any(u => u.UserName == dto.Username);

            bool employeeHasUser = _context.Users
                .Any(u => u.EmployeeId == dto.EmployeeId);

            if (!employeeExists)
            {
                throw new InvalidOperationException("Employee Not Found");
            }

            if (!roleExists)
            {
                throw new InvalidOperationException("Role Not Found");
            }

            if (usernameExists)
            {
                throw new InvalidOperationException("Username Already Exists");
            }

            if (employeeHasUser)
            {
                throw new InvalidOperationException("Employee Already Has A User Account");
            }

            User user = new User
            {
                EmployeeId = dto.EmployeeId,
                RoleId = dto.RoleId,
                UserName = dto.Username,
                HashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsActive = dto.IsActive
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return user.UserId;
        }

        public bool Update(int id, UpdateUserDTO dto)
        {
            User? user = _context.Users.Find(id);

            if (user == null)
            {
                return false;
            }

            bool roleExists = _context.Roles
                .Any(r => r.RoleId == dto.RoleId);

            bool usernameExists = _context.Users
                .Any(u => u.UserName == dto.Username && u.UserId != id);

            if (!roleExists)
            {
                throw new InvalidOperationException("Role Not Found");
            }

            if (usernameExists)
            {
                throw new InvalidOperationException("Username Already Exists");
            }

            user.RoleId = dto.RoleId;
            user.UserName = dto.Username;
            
            user.IsActive = dto.IsActive;

            _context.SaveChanges();

            return true;
        }

        public bool Delete(int id)
        {
            User? user = _context.Users.Find(id);

            if (user == null)
            {
                return false;
            }

            _context.Users.Remove(user);
            _context.SaveChanges();

            return true;
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

        public MyProfileDTO? GetMyProfile(int UserId)
        {
            return _context.Users
                .Where(u => u.UserId == UserId)
                .Select(u => new MyProfileDTO
                {
                    EmployeeId = u.EmployeeId,
                    Username = u.UserName,
                    Name = u.Employee.Name,
                    Phone = u.Employee.Phone,
                    Email = u.Employee.Email,
                    Address = u.Employee.Address,
                    RoleName = u.Role.RoleName,
                    HireDate = u.Employee.HireDate,
                    IsActive = u.Employee.IsActive,
                    PhotoUrl = u.Employee.PhotoUrl
                }).FirstOrDefault();

        }

        public bool UpdateMyProfile(int userId, UpdateMyProfileDTO dto)
        {
            User? user = _context.Users
                .Where(u => u.UserId == userId)
                .Include(u=>u.Employee)
                .FirstOrDefault();

            if (user == null)
            {
                return false;
            }


            Employee employee = user.Employee;

            employee.Name = dto.Name;
            employee.Phone = dto.Phone;
            employee.Email = dto.Email;
            employee.Address = dto.Address;
            if (dto.PhotoUrl != null)
            {
                employee.PhotoUrl = dto.PhotoUrl;
            }

            _context.SaveChanges();

            return true;
        }

        public (bool success, string? oldPhotoUrl) UpdateProfilePhoto(int userId, string newPhotoUrl)
        {
            User? user = _context.Users
                .Where(u => u.UserId == userId)
                .Include(u => u.Employee)
                .FirstOrDefault();

            if (user == null || user.Employee == null)
            {
                return (false, null);
            }

            string? oldPhotoUrl = user.Employee.PhotoUrl;
            user.Employee.PhotoUrl = newPhotoUrl;

            _context.SaveChanges();

            return (true, oldPhotoUrl);
        }

    }
}
