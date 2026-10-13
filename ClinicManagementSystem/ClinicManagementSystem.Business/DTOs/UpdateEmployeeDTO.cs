using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs
{
    public class UpdateEmployeeDTO
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Phone { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        public string? Address { get; set; }

        public DateOnly HireDate { get; set; }

        public bool IsActive { get; set; }
    }
}
