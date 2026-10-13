using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.AppointmentDTOs
{
    public class AppointmentResultDTO
    {
        public bool Success { get; set; }

        public int AppointmentId { get; set; }

        public string Message { get; set; } = string.Empty;
    }
}
