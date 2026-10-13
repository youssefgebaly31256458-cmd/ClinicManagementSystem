using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.PrescriptionDTOs
{
    public class UpdatePrescriptionDTO
    {
        public int PrescriptionId { get; set; }

        public string? Notes { get; set; }
    }
}
