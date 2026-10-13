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
    public class DoctorService
    {
        private readonly ClinicDbContext _context;

        public DoctorService(ClinicDbContext context)
        {
            _context = context;
        }

        public List<DoctorDTO> GetAll()
        {
            List<DoctorDTO> doctors = _context.Doctors
                .Select(d => new DoctorDTO
                {
                    DoctorId = d.DoctorId,
                    EmployeeId = d.EmployeeId,
                    EmployeeName = d.Employee.Name,
                    SpecializationId = d.SpecializationId,
                    SpecializationName = d.Specialization.Name
                })
                .ToList();

            return doctors;
        }

        public DoctorDTO? GetById(int id)
        {
            DoctorDTO? doctor = _context.Doctors
                .Where(d => d.DoctorId == id)
                .Select(d => new DoctorDTO
                {
                    DoctorId = d.DoctorId,
                    EmployeeId = d.EmployeeId,
                    EmployeeName = d.Employee.Name,
                    SpecializationId = d.SpecializationId,
                    SpecializationName = d.Specialization.Name
                })
                .FirstOrDefault();

            return doctor;
        }

        public int Add(AddDoctorDTO dto)
        {
            bool employeeExists = _context.Employees
                .Any(d => d.EmployeeId == dto.EmployeeId);
            if (!employeeExists)
            {
                throw new InvalidOperationException("Employee Not Found");
            }


            bool isDoctorExists = _context.Doctors
        .Any(d => d.EmployeeId == dto.EmployeeId);

            if (isDoctorExists)
            {
                throw new InvalidOperationException("This employee is already registered as a doctor.");
            }

            bool specializationExists = _context.Specializations
                .Any(d => d.SpecializationId == dto.SpecializationId);


            if (!specializationExists)
            {
                throw new InvalidOperationException("Specialization Not Found");
            }

            var doctor = new Doctor
            {
                EmployeeId = dto.EmployeeId,
                SpecializationId = dto.SpecializationId
            };

            _context.Doctors.Add(doctor);
            _context.SaveChanges();

            return doctor.DoctorId;
        }

        public bool Update(int id, UpdateDoctorDTO dto)
        {
            Doctor? doctor = _context.Doctors.Find(id);

            if (doctor == null)
            {
                return false;
            }
            bool isEmployeeAlreadyDoctor = _context.Doctors
                .Any(d => d.EmployeeId == dto.EmployeeId && d.DoctorId != id);

            if (isEmployeeAlreadyDoctor)
            {
                return false;
            }


            bool employeeExists = _context.Employees
                .Any(e => e.EmployeeId == dto.EmployeeId);

            bool specializationExists = _context.Specializations
                .Any(s => s.SpecializationId == dto.SpecializationId);

            if (!employeeExists || !specializationExists)
            {
                return false;
            }

            doctor.EmployeeId = dto.EmployeeId;
            doctor.SpecializationId = dto.SpecializationId;

            _context.SaveChanges();

            return true;
        }

        public bool Delete(int id)
        {
            Doctor? doctor = _context.Doctors.Find(id);

            if (doctor == null)
            {
                return false;
            }

            _context.Doctors.Remove(doctor);
            _context.SaveChanges();

            return true;
        }

    }
}
