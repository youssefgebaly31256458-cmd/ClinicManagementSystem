using System;
using System.Collections.Generic;

namespace ClinicManagementSystem.DataAccess.Models;

public partial class Patient
{
    public int PatientId { get; set; }

    public string Name { get; set; } = null!;

    public string Gender { get; set; } = null!;

    public DateOnly DateOfBirth { get; set; }

    public string Address { get; set; } = null!;

    public bool IsActive { get; set; }

    public string? Phone { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
