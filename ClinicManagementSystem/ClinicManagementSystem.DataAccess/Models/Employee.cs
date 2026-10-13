using System;
using System.Collections.Generic;

namespace ClinicManagementSystem.DataAccess.Models;

public partial class Employee
{
    public int EmployeeId { get; set; }

    public string Name { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string? Email { get; set; }

    public string? Address { get; set; }

    public DateOnly HireDate { get; set; }

    public bool IsActive { get; set; }

    public string? PhotoUrl { get; set; }

    public virtual Doctor? Doctor { get; set; }

    public virtual User? User { get; set; }
}
