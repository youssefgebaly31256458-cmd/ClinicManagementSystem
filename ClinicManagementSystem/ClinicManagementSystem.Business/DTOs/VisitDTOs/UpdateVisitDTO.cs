using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.VisitDTOs
{
    public class UpdateVisitDTO
    {
        public DateTime VisitDate { get; set; }

        public string? Notes { get; set; }
    }
}
