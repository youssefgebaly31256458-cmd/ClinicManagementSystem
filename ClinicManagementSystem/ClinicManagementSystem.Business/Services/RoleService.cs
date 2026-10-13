using ClinicManagementSystem.Business.DTOs.RoleDTOs;
using ClinicManagementSystem.DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.Services
{
    public class RoleService
    {
        private readonly ClinicDbContext _context;

        public RoleService(ClinicDbContext context)
        {
            _context = context;
        }
        public List<RoleDTO> GetAll()
        {
            List<RoleDTO> roles = _context.Roles
                .Select(r => new RoleDTO
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName
                })
                .ToList();

            return roles;
        }

        public RoleDTO? GetById(int id)
        {
            RoleDTO? role = _context.Roles
                .Where(r => r.RoleId == id)
                .Select(r => new RoleDTO
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName
                })
                .FirstOrDefault();

            return role;
        }

        public int Add(AddRoleDTO dto)
        {
            bool roleExists = _context.Roles
                .Any(r => r.RoleName == dto.RoleName);

            if (roleExists)
            {
                throw new InvalidOperationException("Role Already Exists");
            }

            Role role = new Role
            {
                RoleName = dto.RoleName
            };

            _context.Roles.Add(role);
            _context.SaveChanges();

            return role.RoleId;
        }

        public bool Update(int id, UpdateRoleDTO dto)
        {
            Role? role = _context.Roles.Find(id);

            if (role == null)
            {
                return false;
            }

            bool roleExists = _context.Roles
                .Any(r => r.RoleName == dto.RoleName && r.RoleId != id);

            if (roleExists)
            {
                throw new InvalidOperationException("Role Already Exists");
            }

            role.RoleName = dto.RoleName;

            _context.SaveChanges();

            return true;
        }

        public bool Delete(int id)
        {
            Role? role = _context.Roles.Find(id);

            if (role == null)
            {
                return false;
            }

            _context.Roles.Remove(role);
            _context.SaveChanges();

            return true;
        }
    }
}
