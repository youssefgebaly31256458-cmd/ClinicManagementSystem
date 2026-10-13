using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.PrescriptionDTOs
{
    public class PrescriptionResultDTO
    {
        public bool Success { get; set; }

        public int PrescriptionId { get; set; }

        public string Message { get; set; } = null!;
    }
}

