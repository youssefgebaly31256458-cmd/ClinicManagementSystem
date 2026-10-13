using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ClinicManagementSystem.Business.DTOs.AuthenticationDTOs
{
    public class RefreshTokenDTO
    {
        [Required]
        public string RefreshToken { get; set; } = null!;
    }
}
