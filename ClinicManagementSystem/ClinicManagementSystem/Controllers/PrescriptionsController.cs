using ClinicManagementSystem.Business.DTOs.PrescriptionDTOs;
using ClinicManagementSystem.Business.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace ClinicManagementSystem.Controllers
{
    [Route("api/ClinicManagementSystem/[controller]")]
    [ApiController]
    public class PrescriptionsController : ControllerBase
    {
        private readonly PrescriptionService _service;
        private readonly IAuthorizationService _authorizationService;

        public PrescriptionsController(
            PrescriptionService service,
            IAuthorizationService authorizationService)
        {
            _service = service;
            _authorizationService = authorizationService;
        }


        /// <summary>
        /// Gets all prescriptions.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = ("Doctor,Admin,Receptionist"))]
        [ProducesResponseType(typeof(List<PrescriptionDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<IEnumerable<PrescriptionDTO>> GetAll()
        {
            if (User.IsInRole("Doctor"))
            {
                var employeeIdClaim = User.FindFirst("EmployeeId");

                if (employeeIdClaim == null ||
                    !int.TryParse(employeeIdClaim.Value, out int currentEmployeeId))
                {
                    return Forbid();
                }

                List<PrescriptionDTO> prescription =
                    _service.GetByEmployeeId(currentEmployeeId);

                return Ok(prescription);
            }

            List<PrescriptionDTO> allPrescriptions = _service.GetAll();

            return Ok(allPrescriptions);
        }


        /// <summary>
        /// Gets prescription by ID.
        /// </summary>
        [HttpGet("{id}", Name = "GetPrescriptionById")]
        [Authorize(Roles = ("Admin,Receptionist,Doctor"))]
        [ProducesResponseType(typeof(PrescriptionDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PrescriptionDTO>> GetById(int id)
        {
            PrescriptionDTO? prescription = _service.GetById(id);

            if (prescription == null)
            {
                return NotFound($"Prescription with ID = {id} was not found.");
            }

            var authorizationResult = await _authorizationService.AuthorizeAsync(
                User,
                prescription,
                "DoctorOwnResource");

            if (!authorizationResult.Succeeded &&
                !User.IsInRole("Admin") &&
                !User.IsInRole("Receptionist"))
            {
                return Forbid();
            }

            return Ok(prescription);
        }


        /// <summary>
        /// Adds a new prescription.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = ("Doctor"))]
        [ProducesResponseType(typeof(PrescriptionDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<PrescriptionDTO> Add(AddPrescriptionDTO dto)
        {
            if (dto == null)
                return BadRequest("Invalid prescription data.");

            var employeeIdClaim = User.FindFirst("EmployeeId");

            if (employeeIdClaim == null ||
                !int.TryParse(employeeIdClaim.Value, out int currentEmployeId))
            {
                return Forbid();
            }

            PrescriptionResultDTO result =
                _service.Add(dto, currentEmployeId);

            if (!result.Success)
            {
                if (result.Message ==
                    "You are not Authorized to creat a prescription for this visit.")
                {
                    return Forbid();
                }

                if (result.Message == "Visit not found.")
                {
                    return NotFound(result.Message);
                }

                return BadRequest(result.Message);
            }

            PrescriptionDTO? prescription =
                _service.GetById(result.PrescriptionId);

            return CreatedAtRoute(
                "GetPrescriptionById",
                new { id = result.PrescriptionId },
                prescription);
        }


        /// <summary>
        /// Updates an existing prescription.
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = ("Doctor"))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Update(
            int id,
            UpdatePrescriptionDTO dto)
        {
            if (dto == null)
                return BadRequest("Invalid prescription data.");

            PrescriptionDTO? prescription = _service.GetById(id);

            if (prescription == null)
            {
                return NotFound($"Prescription with ID = {id} was not found.");
            }

            var authorizationResult = await _authorizationService.AuthorizeAsync(
                User,
                prescription,
                "DoctorOwnResource");

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }

            string message = _service.Update(id, dto);

            if (message == "Prescription not found.")
            {
                return NotFound(message);
            }

            if (message != "Prescription updated successfully.")
            {
                return BadRequest(message);
            }

            return NoContent();
        }


        /// <summary>
        /// Deletes a prescription.
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Delete(int id)
        {
            PrescriptionDTO? prescription = _service.GetById(id);

            if (prescription == null)
            {
                return NotFound($"Prescription with ID = {id} was not found.");
            }

            var authorizationResult = await _authorizationService.AuthorizeAsync(
                User,
                prescription,
                "DoctorOwnResource");

            if (!authorizationResult.Succeeded)
            {
                return Forbid();
            }

            string message = _service.Delete(id);

            if (message == "Prescription not found.")
            {
                return NotFound(message);
            }

            if (message != "Prescription deleted successfully.")
            {
                return BadRequest(message);
            }

            return NoContent();
        }
    }
}