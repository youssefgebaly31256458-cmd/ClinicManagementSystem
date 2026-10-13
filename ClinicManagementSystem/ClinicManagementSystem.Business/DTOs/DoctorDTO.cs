using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs
{
    public class DoctorDTO
    {
        public int DoctorId { get; set; }

        public int SpecializationId { get; set; }

        public string SpecializationName { get; set; } = null!;

        public int EmployeeId { get; set; }

        public string EmployeeName { get; set; } = null!;
    }
}
