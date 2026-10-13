using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs
{
    public class SpecializationDTO
    {
        public int SpecializationID { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
    }
}
