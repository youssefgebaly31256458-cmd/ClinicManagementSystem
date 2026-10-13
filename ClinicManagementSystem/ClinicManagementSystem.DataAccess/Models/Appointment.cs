using System;
using System.Collections.Generic;

namespace ClinicManagementSystem.DataAccess.Models;

public partial class Appointment
{
    public int AppointmentId { get; set; }

    public DateTime Date { get; set; }

    public string? Notes { get; set; }

    public int Status { get; set; }

    public int PatientId { get; set; }

    public int DoctorId { get; set; }

    public virtual Doctor Doctor { get; set; } = null!;

    public virtual Patient Patient { get; set; } = null!;

    public virtual Visit? Visit { get; set; }
}
