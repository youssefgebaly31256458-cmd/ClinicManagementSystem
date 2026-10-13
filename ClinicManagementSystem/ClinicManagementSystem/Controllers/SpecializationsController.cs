using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ClinicManagementSystem.Business.Services;
using ClinicManagementSystem.Business.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace ClinicManagementSystem.Controllers
{
    [Route("api/ClinicManagementSystem/[controller]")]
    [ApiController]
    [Authorize]
    public class SpecializationsController : ControllerBase
    {

        private readonly SpecializationService _service;

        public SpecializationsController(SpecializationService service)
        {
            _service = service;
        }

        /// <summary>
        /// Retrieves all specializations.
        /// </summary>
        /// <returns>A list of all specializations.</returns>
        [HttpGet]
        [Authorize(Roles =("Admin,Receptionist,Doctor"))]
        [ProducesResponseType(typeof(List<SpecializationDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<IEnumerable<SpecializationDTO>> GetAll()
        {
            var specializations = _service.GetAll();

            return Ok(specializations);
        }

        /// <summary>
        /// Retrieves a specialization by its ID.
        /// </summary>
        /// <param name="id">The specialization ID.</param>
        /// <returns>The specialization if found.</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = ("Admin,Receptionist,Doctor"))]
        [ProducesResponseType(typeof(SpecializationDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<SpecializationDTO> GetById(int id)
        {
            var specialization = _service.GetById(id);

            if (specialization == null)
                return NotFound();

            return Ok(specialization);
        }

        /// <summary>
        /// Creates a new specialization.
        /// </summary>
        /// <param name="dto">Specialization information.</param>
        /// <returns>The newly created specialization.</returns>
        [HttpPost]
        [Authorize(Roles =("Admin"))]
        [ProducesResponseType(typeof(SpecializationDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<SpecializationDTO> Add(AddSpecializationDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Invalid specialization data.");

            try
            {
                int specializationId = _service.Add(dto);

                var specialization = _service.GetById(specializationId);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = specializationId },
                    specialization);
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
        /// Updates an existing specialization.
        /// </summary>
        /// <param name="id">Specialization ID.</param>
        /// <param name="dto">Updated specialization information.</param>
        /// <returns>No content if updated successfully.</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = ("Admin"))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult Update(int id, UpdateSpecializationDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Invalid specialization data.");
            }

            try
            {
                bool isUpdated = _service.Update(id, dto);

                if (!isUpdated)
                {
                    return NotFound($"Specialization with ID = {id} was not found.");
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        ///// <summary>
        ///// Deletes a specialization.
        ///// </summary>
        ///// <param name="id">Specialization ID.</param>
        //[HttpDelete("{id}")]
        //[Authorize(Roles = ("Admin"))]
        //[ProducesResponseType(StatusCodes.Status204NoContent)]
        //[ProducesResponseType(StatusCodes.Status404NotFound)]
        //[ProducesResponseType(StatusCodes.Status500InternalServerError)]
        //public ActionResult Delete(int id)
        //{
        //    bool isDeleted = _service.Delete(id);

        //    if (!isDeleted)
        //    {
        //        return NotFound($"Specialization with ID = {id} was not found.");
        //    }

        //    return NoContent();
        //}
    
    }
}
