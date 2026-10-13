using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.UserDTOs
{
    public class UserDTO
    {
        public int UserId { get; set; }

        public int EmployeeId { get; set; }

        public string EmployeeName { get; set; } = null!;

        public int RoleId { get; set; }

        public string RoleName { get; set; } = null!;

        public string Username { get; set; } = null!;

        public bool IsActive { get; set; }
    }
}
