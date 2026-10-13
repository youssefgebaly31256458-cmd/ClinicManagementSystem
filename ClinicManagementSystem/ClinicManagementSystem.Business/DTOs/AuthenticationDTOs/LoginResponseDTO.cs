using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.AuthenticationDTOs
{
    
        public class LoginResponseDTO
        {
            public int UserId { get; set; }

            public int EmployeeId { get; set; }

            public string Name { get; set; } = null!;

            public string Email { get; set; } = null!;

            public int RoleId { get; set; }

            public string RoleName { get; set; } = null!;

            public string Token { get; set; } = null!;
        
        }
    }


