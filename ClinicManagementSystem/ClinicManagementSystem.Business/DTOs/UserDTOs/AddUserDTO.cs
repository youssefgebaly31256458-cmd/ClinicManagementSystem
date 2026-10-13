using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.UserDTOs
{
    public class AddUserDTO
    {
        public int EmployeeId { get; set; }

        public int RoleId { get; set; }

        public string Username { get; set; } = null!;

        public string Password { get; set; } = null!;

        public bool IsActive { get; set; }
    }
}
