namespace ClinicManagementSystem.Business.DTOs.VisitDTOs
{
    public class VisitResultDTO
    {
        public bool Success { get; set; }

        public int VisitId { get; set; }

        public string Message { get; set; } = string.Empty;
    }
}