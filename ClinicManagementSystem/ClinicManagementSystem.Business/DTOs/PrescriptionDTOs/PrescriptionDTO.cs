using ClinicManagementSystem.Business.Services;

namespace ClinicManagementSystem.Business.DTOs.PrescriptionDTOs
{
    public class PrescriptionDTO : IOwnedResource
    {
        public int PrescriptionId { get; set; }

        public int VisitId { get; set; }

        public DateTime? VisitDate { get; set; }

        public string? PatientName { get; set; }

        public string? DoctorName { get; set; }

        public int? DoctorEmployeeId { get; set; }

        public string? Notes { get; set; }

        public int EmployeeId => DoctorEmployeeId ?? 0;
    }
}