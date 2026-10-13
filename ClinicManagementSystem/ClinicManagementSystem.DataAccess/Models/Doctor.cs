using System;
using System.Collections.Generic;

namespace ClinicManagementSystem.DataAccess.Models;

public partial class Doctor
{
    public int DoctorId { get; set; }

    public int SpecializationId { get; set; }

    public int EmployeeId { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual Employee Employee { get; set; } = null!;

    public virtual Specialization Specialization { get; set; } = null!;
}
