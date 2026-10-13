
using ClinicManagementSystem.Business.DTOs.AppointmentDTOs;
using ClinicManagementSystem.Business.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ClinicManagementSystem.Controllers
{
    [Route("api/ClinicManagementSystem/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppointmentService _service;
        private readonly IAuthorizationService _authorizationService;
        public AppointmentsController(AppointmentService service,
            IAuthorizationService authorizationService)
        {
            _service = service;
            _authorizationService = authorizationService;
        }

        /// <summary>
        /// Gets all appointments.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Receptionist,Doctor")]
        [ProducesResponseType(typeof(List<AppointmentDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<IEnumerable<AppointmentDTO>> GetAll()
        {
            if (User.IsInRole("Doctor"))
            {
                var employeeIdClaim = User.FindFirst("EmployeeId");

                if (employeeIdClaim == null ||
                    !int.TryParse(employeeIdClaim.Value, out int currentEmployeeId))
                {
                    return Forbid();
                }

                return Ok(_service.GetByEmployeeId(currentEmployeeId));
            }

            return Ok(_service.GetAll());
        }

        /// <summary>
        /// Gets appointment by ID.
        /// </summary>
        [HttpGet("{id}", Name = "GetAppointmentById")]
        [Authorize(Roles = "Admin,Receptionist,Doctor")]
        [ProducesResponseType(typeof(AppointmentDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AppointmentDTO>> GetById(int id)
        {
            AppointmentDTO? appointment = _service.GetById(id);

            if (appointment == null)
            {
                return NotFound($"Appointment with ID = {id} was not found.");
            }

            var authorizationResult = await _authorizationService.AuthorizeAsync(
                User,
                appointment,
                "DoctorOwnResource");

            if (!authorizationResult.Succeeded &&
                !User.IsInRole("Admin") &&
                !User.IsInRole("Receptionist"))
            {
                return Forbid();
            }

            return Ok(appointment);
        }

        /// <summary>
        /// Gets appointments for the currently authenticated doctor.
        /// </summary>
        [HttpGet("MyAppointments")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(List<AppointmentDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<IEnumerable<AppointmentDTO>> GetMyAppointments()
        {
            var employeeIdClaim = User.FindFirst("EmployeeId");

            if (employeeIdClaim == null ||
                !int.TryParse(employeeIdClaim.Value, out int currentEmployeeId))
            {
                return Forbid();
            }

            List<AppointmentDTO> appointments =
                _service.GetByEmployeeId(currentEmployeeId);

            return Ok(appointments);
        }

        /// <summary>
        /// Creates a new appointment.
        /// </summary>
        [Authorize(Roles = "Admin,Receptionist")]
        [HttpPost]
        [ProducesResponseType(typeof(AppointmentDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public ActionResult<AppointmentDTO> Add(AddAppointmentDTO dto)
        {
            if (dto == null)
                return BadRequest("Invalid appointment data.");

            AppointmentResultDTO result = _service.Add(dto);

            if (!result.Success)
                return BadRequest(result.Message);

            AppointmentDTO? appointment =
                _service.GetById(result.AppointmentId);

            return CreatedAtRoute(
                "GetAppointmentById",
                new { id = result.AppointmentId },
                appointment);
        }

        /// <summary>
        /// Updates an appointment.
        /// </summary>
        [Authorize(Roles = "Admin,Receptionist")]
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult Update(int id, UpdateAppointmentDTO dto)
        {
            if (dto == null)
                return BadRequest("Invalid appointment data.");

            string message = _service.Update(id, dto);

            if (message != "Appointment updated successfully.")
            {
                if (message == "Appointment not found.")
                    return NotFound(message);

                return BadRequest(message);
            }

            return NoContent();
        }

        /// <summary>
        /// Changes appointment status.
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin,Receptionist,Doctor")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> ChangeStatus(
    int id,
    [FromBody] ChangeAppointmentStatusDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Invalid appointment status data.");
            }

            if (!Enum.IsDefined(
                typeof(AppointmentService.enAppointmentStatus),
                dto.Status))
            {
                return BadRequest("Invalid appointment status.");
            }

            AppointmentDTO? appointment = _service.GetById(id);

            if (appointment == null)
            {
                return NotFound($"Appointment with ID = {id} was not found.");
            }

            var authorizationResult = await _authorizationService.AuthorizeAsync(
                User,
                appointment,
                "DoctorOwnResource");

            if (!authorizationResult.Succeeded && !User.IsInRole("Admin") && !User.IsInRole("Receptionist"))
            {
                return Forbid();
            }

            string message = _service.ChangeStatus(
                id,
                (AppointmentService.enAppointmentStatus)dto.Status);

            if (message == "Appointment not found.")
            {
                return NotFound(message);
            }

            return NoContent();
        }





        [Authorize(Roles = "Admin,Receptionist")]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult Delete(int id)
        {
            string message = _service.Delete(id);

            if (message == "Appointment not found.")
                return NotFound(message);

            if (message != "Appointment deleted successfully.")
                return BadRequest(message);

            return NoContent();
        }
    }
}

