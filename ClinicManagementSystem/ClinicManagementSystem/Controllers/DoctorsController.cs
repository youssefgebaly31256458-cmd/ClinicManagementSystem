using ClinicManagementSystem.Business.DTOs;
using ClinicManagementSystem.Business.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ClinicManagementSystem.Controllers
{
    [Authorize]
    [Route("api/ClinicManagementSystem/[controller]")]
    [ApiController]
    public class DoctorsController : ControllerBase
    {
        private readonly DoctorService _service;

        public DoctorsController(DoctorService service)
        {
            _service = service;
        }

        /// <summary>
        /// Gets all doctors.
        /// </summary>
        /// <returns>List of doctors.</returns>
        [Authorize(Roles ="Admin")]
        [HttpGet]
        [ProducesResponseType(typeof(List<DoctorDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<IEnumerable<DoctorDTO>> GetAll()
        {
            List<DoctorDTO> doctors = _service.GetAll();

            return Ok(doctors);
        }

        /// <summary>
        /// Gets a doctor by ID.
        /// </summary>
        /// <param name="id">Doctor ID.</param>
        /// <returns>Doctor information.</returns>
        [Authorize(Roles = "Admin,Doctor")]
        [HttpGet("{id}", Name = "GetDoctorById")]
        [ProducesResponseType(typeof(DoctorDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<DoctorDTO> GetById(int id)
        {
            if (User.IsInRole("Admin"))
            {
                DoctorDTO? doctor = _service.GetById(id);
                if (doctor == null)
                {
                    return NotFound($"Doctor with ID = {id} was not found.");
                }
                return Ok(doctor);
            }
            var employeeClaimId = User.FindFirst("EmployeeId");
            if (employeeClaimId == null || !int.TryParse(employeeClaimId.Value, out int currentEmployeeId))
            {
                return Forbid();
            }

            DoctorDTO? RequstedDoctor = _service.GetById(id);


            if (RequstedDoctor == null)
            {
                return NotFound($"Doctor with ID = {id} was not found.");
            }
            if (RequstedDoctor.EmployeeId != currentEmployeeId)
            {
                return Forbid();
            }
            return Ok(RequstedDoctor);


        }

        /// <summary>
        /// Creates a new doctor.
        /// </summary>
        /// <param name="dto">Doctor information.</param>
        /// <returns>The newly created doctor.</returns>
        [Authorize(Roles ="Admin")]
        [HttpPost]
        [ProducesResponseType(typeof(DoctorDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<DoctorDTO> Add(AddDoctorDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Invalid doctor data.");
            }

            try
            {
                int doctorId = _service.Add(dto);

                

                DoctorDTO? doctor = _service.GetById(doctorId);

                return CreatedAtAction(nameof(GetById), new { id = doctorId }, doctor);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Updates an existing doctor.
        /// </summary>
        /// <param name="id">Doctor ID.</param>
        /// <param name="dto">Updated doctor information.</param>
        /// <returns>No content if updated successfully.</returns>
        [Authorize(Roles ="Admin")]
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult Update(int id, UpdateDoctorDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Invalid doctor data.");
            }

            bool isUpdated = _service.Update(id, dto);

            if (!isUpdated)
            {
                return NotFound($"Doctor with ID = {id} was not found, or Employee ID / Specialization ID is invalid.");
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a doctor.
        /// </summary>
        /// <param name="id">Doctor ID.</param>
        /// <returns>No content if deleted successfully.</returns>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult Delete(int id)
        {
            bool isDeleted = _service.Delete(id);

            if (!isDeleted)
            {
                return NotFound($"Doctor with ID = {id} was not found.");
            }

            return NoContent();
        }
    }
}
