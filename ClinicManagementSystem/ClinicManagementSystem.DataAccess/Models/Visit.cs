using System;
using System.Collections.Generic;

namespace ClinicManagementSystem.DataAccess.Models;

public partial class Visit
{
    public int VisitId { get; set; }

    public DateTime VisitDate { get; set; }

    public string? Notes { get; set; }

    public int AppointmentId { get; set; }

    public virtual Appointment Appointment { get; set; } = null!;

    public virtual Prescription? Prescription { get; set; }
}
