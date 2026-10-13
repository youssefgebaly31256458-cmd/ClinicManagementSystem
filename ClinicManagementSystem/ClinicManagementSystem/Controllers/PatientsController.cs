using ClinicManagementSystem.Business.DTOs.PatientDTOs;
using ClinicManagementSystem.Business.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace ClinicManagementSystem.Controllers
{
    [Authorize]
    [Route("api/ClinicManagementSystem/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly PatientService _service;

        public PatientsController(PatientService service)
        {
            _service = service;
        }

        /// <summary>
        /// Gets all patients.
        /// </summary>
        /// <returns>List of patients.</returns>
        [Authorize(Roles =("Admin,Receptionist,Doctor"))]
        [HttpGet]
        [ProducesResponseType(typeof(List<PatientDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<IEnumerable<PatientDTO>> GetAll()
        {
            List<PatientDTO> patients = _service.GetAll();

            return Ok(patients);
        }

        /// <summary>
        /// Gets a patient by ID.
        /// </summary>
        /// <param name="id">Patient ID.</param>
        /// <returns>Patient information.</returns>
        [Authorize(Roles =("Admin,Receptionist,Doctor"))]
        [HttpGet("{id}", Name = "GetPatientById")]
        [ProducesResponseType(typeof(PatientDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<PatientDTO> GetById(int id)
        {
            PatientDTO? patient = _service.GetById(id);

            if (patient == null)
            {
                return NotFound($"Patient with ID = {id} was not found.");
            }

            return Ok(patient);
        }

        /// <summary>
        /// Creates a new patient.
        /// </summary>
        /// <param name="dto">Patient information.</param>
        /// <returns>The newly created patient.</returns>
        [Authorize(Roles = "Admin,Receptionist")]
        [HttpPost]
        [ProducesResponseType(typeof(PatientDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<PatientDTO> Add(AddPatientDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Invalid patient data.");
            }

            try
            {
                int patientId = _service.Add(dto);

                PatientDTO? patient = _service.GetById(patientId);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = patientId },
                    patient);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Updates an existing patient.
        /// </summary>
        /// <param name="id">Patient ID.</param>
        /// <param name="dto">Updated patient information.</param>
        /// <returns>No content if updated successfully.</returns>
        [Authorize(Roles = "Admin,Receptionist")]
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult Update(int id, UpdatePatientDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Invalid patient data.");
            }

            try
            {
                bool isUpdated = _service.Update(id, dto);

                if (!isUpdated)
                {
                    return NotFound($"Patient with ID = {id} was not found.");
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [Authorize(Roles = "Admin,Receptionist")]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult Delete(int id)
        {
            string message = _service.Delete(id);

            if (message == "Patient not found.")
                return NotFound(message);

            if (message != "Patient deleted successfully.")
                return BadRequest(message);

            return NoContent();
        }
    }
}