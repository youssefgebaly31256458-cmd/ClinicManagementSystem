using ClinicManagementSystem.Business.DTOs;
using ClinicManagementSystem.DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.Services
{
    public class EmployeeService
    {
        private readonly ClinicDbContext _context;

        public EmployeeService(ClinicDbContext context)
        {
            _context = context;
        }
        public List<EmployeeDTO> GetAll()
        {
            List<EmployeeDTO> employees = _context.Employees
                .Select(e => new EmployeeDTO
                {
                    EmployeeId = e.EmployeeId,
                    Name = e.Name,
                    Phone = e.Phone,
                    Email = e.Email,
                    Address = e.Address,
                    HireDate = e.HireDate,
                    IsActive = e.IsActive
                })
                .ToList();
            

            return employees;
        }

        public EmployeeDTO? GetById(int id)
        {
            EmployeeDTO? employee = _context.Employees
                .Where(e => e.EmployeeId == id)
                .Select(e => new EmployeeDTO
                {
                    EmployeeId = e.EmployeeId,
                    Name = e.Name,
                    Phone = e.Phone,
                    Email = e.Email,
                    Address = e.Address,
                    HireDate = e.HireDate,
                    IsActive = e.IsActive
                })
                .FirstOrDefault();

            return employee;
        }

        public List<EmployeeDTO> GetAvailableForDoctor()
        {
            return _context.Employees
                .Where(e => e.IsActive && !_context.Doctors.Any(d => d.EmployeeId == e.EmployeeId))
                .Select(e => new EmployeeDTO
                {
                    EmployeeId = e.EmployeeId,
                    Name = e.Name,
                    Phone = e.Phone,
                    Email = e.Email,
                    Address = e.Address,
                    HireDate = e.HireDate,
                    IsActive = e.IsActive
                })
                .ToList();
        }

        public int Add(AddEmployeeDTO dto)
        {
            bool emailExists = _context.Employees
                .Any(e => e.Email == dto.Email);

            if (emailExists)
            {
                return -1;
            }

            Employee employee = new Employee
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                HireDate = dto.HireDate,
                IsActive = dto.IsActive
            };

            _context.Employees.Add(employee);
            _context.SaveChanges();

            return employee.EmployeeId;
        }

        public string Update(int id, UpdateEmployeeDTO dto)
        {
            Employee? employee = _context.Employees.Find(id); 
            if (employee == null)
            {
                return "Employee not Found.";
            }
            bool emailExist = _context.Employees
                .Any(e => e.Email == dto.Email && e.EmployeeId != id);

            if (emailExist)
            {
                return "Email alreade Exists.";
            }

            employee.Name = dto.Name;
            employee.Phone = dto.Phone;
            employee.Address = dto.Address;
            employee.Email = dto.Email;
            employee.HireDate = dto.HireDate;
            employee.IsActive = dto.IsActive;

            _context.SaveChanges();
            return "Employee updated successfully.";

        }

        public bool Delete(int id)
        {
            Employee? employee = _context.Employees.Find(id);

            if (employee == null)
            {
                return false;
            }

            _context.Employees.Remove(employee);
            _context.SaveChanges();

            return true;
        }
    }

}
