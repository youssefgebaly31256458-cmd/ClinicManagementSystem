using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs
{
    public class AddDoctorDTO
    {
        public int SpecializationId { get; set; }

        public int EmployeeId { get; set; }
    }
}
