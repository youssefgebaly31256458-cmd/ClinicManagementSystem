using ClinicManagementSystem.Business.DTOs.PrescriptionDTOs;
using ClinicManagementSystem.DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagementSystem.Business.Services
{
    public class PrescriptionService
    {
        private readonly ClinicDbContext _context;

        public PrescriptionService(ClinicDbContext context)
        {
            _context = context;
        }

        public List<PrescriptionDTO> GetAll()
        {
            return _context.Prescriptions
                .Select(p => new PrescriptionDTO
                {
                    PrescriptionId = p.PrescriptionId,
                    VisitId = p.VisitId,
                    VisitDate = p.Visit.VisitDate,
                    PatientName = p.Visit.Appointment.Patient.Name,
                    DoctorName = p.Visit.Appointment.Doctor.Employee.Name,
                    DoctorEmployeeId = p.Visit.Appointment.Doctor.EmployeeId,
                    Notes = p.Notes
                })
                .ToList();
        }

        public List<PrescriptionDTO> GetByEmployeeId(int employeeId)
        {
            return _context.Prescriptions
                .Where(p => p.Visit.Appointment.Doctor.EmployeeId == employeeId)
                .Select(p => new PrescriptionDTO
                {
                    PrescriptionId = p.PrescriptionId,
                    VisitId = p.VisitId,
                    VisitDate = p.Visit.VisitDate,
                    PatientName = p.Visit.Appointment.Patient.Name,
                    DoctorName = p.Visit.Appointment.Doctor.Employee.Name,
                    DoctorEmployeeId = p.Visit.Appointment.Doctor.EmployeeId,
                    Notes = p.Notes
                })
                .ToList();
        }

        public PrescriptionDTO? GetById(int id)
        {
            return _context.Prescriptions
                .Where(p => p.PrescriptionId == id)
                .Select(p => new PrescriptionDTO
                {
                    PrescriptionId = p.PrescriptionId,
                    VisitId = p.VisitId,
                    VisitDate = p.Visit.VisitDate,
                    PatientName = p.Visit.Appointment.Patient.Name,
                    DoctorName = p.Visit.Appointment.Doctor.Employee.Name,
                    DoctorEmployeeId = p.Visit.Appointment.Doctor.EmployeeId,
                    Notes = p.Notes
                })
                .FirstOrDefault();
        }

        public PrescriptionResultDTO Add(AddPrescriptionDTO dto, int? currentEmployeeId = null)
        {
            Visit? visit = _context.Visits
                .Include(v => v.Appointment)
                .ThenInclude(a => a.Doctor)
                .FirstOrDefault(v => v.VisitId == dto.VisitId);

            if (visit == null)
            {
                return new PrescriptionResultDTO
                {
                    Success = false,
                    Message = "Visit not found."
                };
            }

            if (currentEmployeeId.HasValue &&
                visit.Appointment.Doctor.EmployeeId != currentEmployeeId)
            {
                return new PrescriptionResultDTO
                {
                    Success = false,
                    Message = "You are not authorized to create a prescription for this visit."
                };
            }

            if (_context.Prescriptions.Any(p => p.VisitId == dto.VisitId))
            {
                return new PrescriptionResultDTO
                {
                    Success = false,
                    Message = "This visit already has a prescription."
                };
            }

            Prescription prescription = new Prescription
            {
                VisitId = dto.VisitId,
                Notes = dto.Notes
            };

            _context.Prescriptions.Add(prescription);
            _context.SaveChanges();

            return new PrescriptionResultDTO
            {
                Success = true,
                PrescriptionId = prescription.PrescriptionId,
                Message = "Prescription added successfully."
            };
        }

        public string Update(int id, UpdatePrescriptionDTO dto)
        {
            Prescription? prescription = _context.Prescriptions
                .FirstOrDefault(p => p.PrescriptionId == id);

            if (prescription == null)
                return "Prescription not found.";

            prescription.Notes = dto.Notes;

            _context.SaveChanges();

            return "Prescription updated successfully.";
        }

        public string Delete(int id)
        {
            Prescription? prescription = _context.Prescriptions
                .FirstOrDefault(p => p.PrescriptionId == id);

            if (prescription == null)
                return "Prescription not found.";

            _context.Prescriptions.Remove(prescription);

            _context.SaveChanges();

            return "Prescription deleted successfully.";
        }
    }
}