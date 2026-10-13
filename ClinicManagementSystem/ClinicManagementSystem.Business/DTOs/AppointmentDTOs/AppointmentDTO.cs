namespace ClinicManagementSystem.Business.DTOs.AppointmentDTOs
{
    public class AppointmentDTO : IOwnedResource
    {
        public int AppointmentId { get; set; }

        public DateTime Date { get; set; }

        public string? Notes { get; set; }

        public int Status { get; set; }

        public int PatientId { get; set; }

        public string PatientName { get; set; } = null!;

        public int DoctorId { get; set; }

        public string DoctorName { get; set; } = null!;

        public int DoctorEmployeeId { get; set; }

        public int EmployeeId => DoctorEmployeeId;
    }
}