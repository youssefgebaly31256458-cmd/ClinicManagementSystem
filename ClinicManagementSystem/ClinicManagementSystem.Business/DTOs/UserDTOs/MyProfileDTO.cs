using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.UserDTOs
{
    public class MyProfileDTO
    {
        public int EmployeeId { get; set; }

        public string Username { get; set; } = null!;

        public string Name { get; set; } = null!;

        public string Phone { get; set; } = null!;

        public string? Email { get; set; }

        public string? Address { get; set; }

        public string RoleName { get; set; } = null!;

        public DateOnly HireDate { get; set; }

        public bool IsActive { get; set; }

        public string? PhotoUrl { get; set; }
    }
}
