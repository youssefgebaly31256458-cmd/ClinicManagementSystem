using System;
using System.Collections.Generic;

namespace ClinicManagementSystem.DataAccess.Models;

public partial class Prescription
{
    public int PrescriptionId { get; set; }

    public int VisitId { get; set; }

    public string? Notes { get; set; }

    public virtual Visit Visit { get; set; } = null!;
}
