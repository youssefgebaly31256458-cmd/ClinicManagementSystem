using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using ClinicManagementSystem.Business;

namespace ClinicManagementSystem.Business.DTOs.VisitDTOs
{
    public class VisitDTO : IOwnedResource
    {
        public int VisitId { get; set; }

        public DateTime VisitDate { get; set; }

        public string? Notes { get; set; }

        public int AppointmentId { get; set; }

        public string PatientName { get; set; } = null!;

        public string DoctorName { get; set; } = null!;

        public int DoctorEmployeeId { get; set; }

        public int EmployeeId => DoctorEmployeeId;
    }
}
