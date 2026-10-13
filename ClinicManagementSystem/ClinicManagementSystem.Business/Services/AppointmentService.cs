
using ClinicManagementSystem.Business.DTOs.AppointmentDTOs;
using ClinicManagementSystem.DataAccess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.Services
{
    public class AppointmentService
    {
        private readonly ClinicDbContext _context;

        public AppointmentService(ClinicDbContext context)
        {
            _context = context;
        }

        public enum enAppointmentStatus
        {
            Scheduled = 1,
            Completed = 2,
            Cancelled = 3
        }

        public List<AppointmentDTO> GetAll()
        {
            return _context.Appointments
                .Select(a => new AppointmentDTO
                {
                    AppointmentId = a.AppointmentId,
                    Date = a.Date,
                    Notes = a.Notes,
                    Status = a.Status,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.Name,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.Employee.Name,
                    DoctorEmployeeId = a.Doctor.EmployeeId
                })
                .ToList();
        }

        public List<AppointmentDTO> GetByEmployeeId(int employeeId)
        {
            Doctor? doctor = _context.Doctors.FirstOrDefault(d => d.EmployeeId == employeeId);

            if (doctor == null)
            {
                return new List<AppointmentDTO>();
            }

            return _context.Appointments
                .Where(a => a.DoctorId == doctor.DoctorId)
                .Select(a => new AppointmentDTO
                {
                    AppointmentId = a.AppointmentId,
                    Date = a.Date,
                    Notes = a.Notes,
                    Status = a.Status,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.Name,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.Employee.Name,
                    DoctorEmployeeId = a.Doctor.EmployeeId
                })
                .ToList();
        }

        public AppointmentDTO? GetById(int id)
        {
            return _context.Appointments
                .Where(a => a.AppointmentId == id)
                .Select(a => new AppointmentDTO
                {
                    AppointmentId = a.AppointmentId,
                    Date = a.Date,
                    Notes = a.Notes,
                    Status = a.Status,
                    PatientId = a.PatientId,
                    PatientName = a.Patient.Name,
                    DoctorId = a.DoctorId,
                    DoctorName = a.Doctor.Employee.Name,
                    DoctorEmployeeId = a.Doctor.EmployeeId
                })
                .FirstOrDefault();
        }

        public AppointmentResultDTO Add(AddAppointmentDTO dto)
        {
            if (!_context.Patients.Any(p => p.PatientId == dto.PatientId))
            {
                return new AppointmentResultDTO
                {
                    Success = false,
                    Message = "Patient not found."
                };
            }

            if (!_context.Doctors.Any(d => d.DoctorId == dto.DoctorId))
            {
                return new AppointmentResultDTO
                {
                    Success = false,
                    Message = "Doctor not found."
                };
            }

            if (dto.Date <= DateTime.Now)
            {
                return new AppointmentResultDTO
                {
                    Success = false,
                    Message = "Appointment date must be in the future."
                };
            }

            if (_context.Appointments.Any(a =>
                a.DoctorId == dto.DoctorId &&
                a.Date == dto.Date))
            {
                return new AppointmentResultDTO
                {
                    Success = false,
                    Message = "Doctor already has an appointment at this time."
                };
            }

            if (_context.Appointments.Any(a =>
                a.PatientId == dto.PatientId &&
                a.Date == dto.Date))
            {
                return new AppointmentResultDTO
                {
                    Success = false,
                    Message = "Patient already has an appointment at this time."
                };
            }

            Appointment appointment = new Appointment
            {
                Date = dto.Date,
                Notes = dto.Notes,
                Status = (int)enAppointmentStatus.Scheduled,
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId
            };

            _context.Appointments.Add(appointment);
            _context.SaveChanges();

            return new AppointmentResultDTO
            {
                Success = true,
                AppointmentId = appointment.AppointmentId,
                Message = "Appointment added successfully."
            };
        }

        public string Update(int id, UpdateAppointmentDTO dto)
        {
            Appointment? appointment = _context.Appointments.Find(id);

            if (appointment == null)
                return "Appointment not found.";

            if (!_context.Patients.Any(p => p.PatientId == dto.PatientId))
                return "Patient not found.";

            if (!_context.Doctors.Any(d => d.DoctorId == dto.DoctorId))
                return "Doctor not found.";

            if (dto.Date <= DateTime.Now)
                return "Appointment date must be in the future.";

            if (_context.Appointments.Any(a =>
                a.DoctorId == dto.DoctorId &&
                a.Date == dto.Date &&
                a.AppointmentId != id))
            {
                return "Doctor already has an appointment at this time.";
            }

            if (_context.Appointments.Any(a =>
                a.PatientId == dto.PatientId &&
                a.Date == dto.Date &&
                a.AppointmentId != id))
            {
                return "Patient already has an appointment at this time.";
            }

            appointment.Date = dto.Date;
            appointment.Notes = dto.Notes;

            if (!Enum.IsDefined(typeof(enAppointmentStatus), dto.Status))
                return "Invalid appointment status.";


            appointment.Status = dto.Status;
            appointment.PatientId = dto.PatientId;
            appointment.DoctorId = dto.DoctorId;

            _context.SaveChanges();

            return "Appointment updated successfully.";
        }

        public string ChangeStatus(int appointmentId, enAppointmentStatus status)
        {
            Appointment? appointment = _context.Appointments.Find(appointmentId);

            if (appointment == null)
                return "Appointment not found.";


            if (!Enum.IsDefined(typeof(enAppointmentStatus), status))
                return "Invalid appointment status.";

            appointment.Status = (int)status;

            _context.SaveChanges();

            return "Appointment status updated successfully.";
        }

        public string Delete(int id)
        {
            Appointment? appointment = _context.Appointments.Find(id);

            if (appointment == null)
                return "Appointment not found.";

            bool hasVisit = _context.Visits.Any(v => v.AppointmentId == id);

            if (hasVisit)
                return "Cannot delete this appointment because it has a visit associated with it.";

            _context.Appointments.Remove(appointment);
            _context.SaveChanges();

            return "Appointment deleted successfully.";
        }
    }
}

