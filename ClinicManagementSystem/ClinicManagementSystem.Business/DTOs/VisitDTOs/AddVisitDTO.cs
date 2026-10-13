using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.VisitDTOs
{
    public class AddVisitDTO
    {
        public DateTime VisitDate { get; set; }

        public string? Notes { get; set; }

        public int AppointmentId { get; set; }
    }
}
