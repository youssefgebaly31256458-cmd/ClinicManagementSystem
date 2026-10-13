using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.PatientDTOs
{
    public class AddPatientDTO
    {
        public string Name { get; set; } = null!;

        public string Gender { get; set; } = null!;

        public DateOnly DateOfBirth { get; set; }

        public string Phone { get; set; } = null!;

        public string Address { get; set; } = null!;

        public bool IsActive { get; set; }
    }
}
