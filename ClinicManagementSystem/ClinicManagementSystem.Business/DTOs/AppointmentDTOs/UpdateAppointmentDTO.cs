using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.AppointmentDTOs
{
    public class UpdateAppointmentDTO
    {
        public DateTime Date { get; set; }

        public string? Notes { get; set; }

        public int Status { get; set; }

        public int PatientId { get; set; }

        public int DoctorId { get; set; }
    }
}
