using ClinicManagementSystem.Business.DTOs.VisitDTOs;
using ClinicManagementSystem.DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using static ClinicManagementSystem.Business.Services.AppointmentService;

namespace ClinicManagementSystem.Business.Services
{
    public class VisitService
    {
        private readonly ClinicDbContext _context;

        public VisitService(ClinicDbContext context)
        {
            _context = context;
        }

        public List<VisitDTO> GetAll()
        {
            return _context.Visits
                .Select(v => new VisitDTO
                {
                    VisitId = v.VisitId,
                    VisitDate = v.VisitDate,
                    Notes = v.Notes,
                    AppointmentId = v.AppointmentId,
                    PatientName = v.Appointment.Patient.Name,
                    DoctorName = v.Appointment.Doctor.Employee.Name,
                    DoctorEmployeeId = v.Appointment.Doctor.EmployeeId
                })
                .ToList();
        }

        public VisitDTO? GetById(int id)
        {
            return _context.Visits
                .Where(v => v.VisitId == id)
                .Select(v => new VisitDTO
                {
                    VisitId = v.VisitId,
                    VisitDate = v.VisitDate,
                    Notes = v.Notes,
                    AppointmentId = v.AppointmentId,
                    PatientName = v.Appointment.Patient.Name,
                    DoctorName = v.Appointment.Doctor.Employee.Name,
                    DoctorEmployeeId=v.Appointment.Doctor.EmployeeId
                })
                .FirstOrDefault();
        }

        public VisitResultDTO Add(AddVisitDTO dto, int? currentEmployeeId = null)
        {
            Appointment? appointment = _context.Appointments
                .Include(a => a.Doctor)
                .FirstOrDefault(a => a.AppointmentId == dto.AppointmentId);

            if (appointment == null)
            {
                return new VisitResultDTO
                {
                    Success = false,
                    Message = "Appointment not found."
                };
            }

            // Ownership Check
            // Only applies when the request is made by a Doctor.
            if (currentEmployeeId.HasValue &&
                appointment.Doctor.EmployeeId != currentEmployeeId.Value)
            {
                return new VisitResultDTO
                {
                    Success = false,
                    Message = "You are not authorized to create a visit for this appointment."
                };
            }

            if (_context.Visits.Any(v => v.AppointmentId == dto.AppointmentId))
            {
                return new VisitResultDTO
                {
                    Success = false,
                    Message = "This appointment already has a visit."
                };
            }

            if (appointment.Status == (int)enAppointmentStatus.Cancelled)
            {
                return new VisitResultDTO
                {
                    Success = false,
                    Message = "Cannot create a visit for a cancelled appointment."
                };
            }

            if (dto.VisitDate < appointment.Date)
            {
                return new VisitResultDTO
                {
                    Success = false,
                    Message = "Visit date cannot be earlier than appointment date."
                };
            }

            appointment.Status = (int)enAppointmentStatus.Completed;

            Visit visit = new Visit
            {
                VisitDate = dto.VisitDate,
                Notes = dto.Notes,
                AppointmentId = dto.AppointmentId
            };

            _context.Visits.Add(visit);
            _context.SaveChanges();

            return new VisitResultDTO
            {
                Success = true,
                VisitId = visit.VisitId,
                Message = "Visit added successfully."
            };
        }

        public string Update(int id, UpdateVisitDTO dto)
        {
            Visit? visit = _context.Visits
                .Include(v => v.Appointment)
                .FirstOrDefault(v => v.VisitId == id);

            if (visit == null)
                return "Visit not found.";

            if (dto.VisitDate < visit.Appointment.Date)
                return "Visit date cannot be earlier than appointment date.";

            visit.VisitDate = dto.VisitDate;
            visit.Notes = dto.Notes;

            _context.SaveChanges();

            return "Visit updated successfully.";
        }

        public string Delete(int id)
        {
            Visit? visit = _context.Visits.Find(id);

            if (visit == null)
                return "Visit not found.";

            bool hasPrescriptions = _context.Prescriptions
                .Any(p => p.VisitId == id);

            if (hasPrescriptions)
                return "Cannot delete this visit because it has prescriptions associated with it.";

            _context.Visits.Remove(visit);
            _context.SaveChanges();

            return "Visit deleted successfully.";
        }
    }
}