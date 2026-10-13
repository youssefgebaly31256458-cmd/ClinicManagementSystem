using System;
using System.Collections.Generic;

namespace ClinicManagementSystem.DataAccess.Models;

public partial class User
{
    public int UserId { get; set; }

    public string UserName { get; set; } = null!;

    public string HashedPassword { get; set; } = null!;

    public bool IsActive { get; set; }

    public int RoleId { get; set; }

    public int EmployeeId { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }

    public virtual Employee Employee { get; set; } = null!;

    public virtual Role Role { get; set; } = null!;
}
