using ClinicManagementSystem.Business.DTOs.PatientDTOs;
using ClinicManagementSystem.DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.Services
{
    public class PatientService
    {
        private readonly ClinicDbContext _context;

        public PatientService(ClinicDbContext context)
        {
            _context = context;
        }

        public List<PatientDTO> GetAll()
        {
            List<PatientDTO> patients = _context.Patients
                .Select(p => new PatientDTO
                {
                    PatientId = p.PatientId,
                    Name = p.Name,
                    Gender = p.Gender,
                    DateOfBirth = p.DateOfBirth,
                    Phone = p.Phone,
                    Address = p.Address,
                    IsActive = p.IsActive
                })
                .ToList();

            return patients;
        }

        public PatientDTO? GetById(int id)
        {
            PatientDTO? patient = _context.Patients
                .Where(p => p.PatientId == id)
                .Select(p => new PatientDTO
                {
                    PatientId = p.PatientId,
                    Name = p.Name,
                    Phone = p.Phone,
                    Gender = p.Gender,
                    DateOfBirth = p.DateOfBirth,
                    Address = p.Address,
                    IsActive = p.IsActive
                })
                .FirstOrDefault();

            return patient;
        }

        public int Add(AddPatientDTO dto)
        {
            Patient patient = new Patient
            {
                Name = dto.Name,
                Gender = dto.Gender,
                Phone = dto.Phone,
                DateOfBirth = dto.DateOfBirth,
                Address = dto.Address,
                IsActive = dto.IsActive
            };
            if (dto.DateOfBirth > DateOnly.FromDateTime(DateTime.Now))
            {
                throw new InvalidOperationException("Date of birth cannot be in the future.");
            }
            _context.Patients.Add(patient);
            _context.SaveChanges();

            return patient.PatientId;
        }

        public bool Update(int id, UpdatePatientDTO dto)
        {
            Patient? patient = _context.Patients.Find(id);

            if (patient == null)
            {
                return false;
            }

            patient.Name = dto.Name;
            patient.Gender = dto.Gender;
            patient.DateOfBirth = dto.DateOfBirth;
            if (dto.DateOfBirth > DateOnly.FromDateTime(DateTime.Now))
            {
                throw new InvalidOperationException("Date of birth cannot be in the future.");
            }
            patient.Phone = dto.Phone;
            patient.Address = dto.Address;
            patient.IsActive = dto.IsActive;

            _context.SaveChanges();

            return true;
        }

        public string Delete(int id)
        {
            Patient? patient = _context.Patients.Find(id);

            if (patient == null)
                return "Patient not found.";

            bool hasAppointments = _context.Appointments
                .Any(a => a.PatientId == id);

            if (hasAppointments)
                return "Cannot delete this patient because they have appointments associated with them.";

            _context.Patients.Remove(patient);
            _context.SaveChanges();

            return "Patient deleted successfully.";
        }
    }
}
