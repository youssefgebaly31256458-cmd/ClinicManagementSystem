using ClinicManagementSystem.Business.DTOs.VisitDTOs;
using ClinicManagementSystem.Business.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ClinicManagementSystem.Controllers
{
    [Authorize]
    [Route("api/ClinicManagementSystem/[controller]")]
    [ApiController]
    public class VisitsController : ControllerBase
    {
        private readonly VisitService _service;
        private readonly IAuthorizationService _authorizationService;

        public VisitsController(
            VisitService service,
            IAuthorizationService authorizationService)
        {
            _service = service;
            _authorizationService = authorizationService;
        }

        /// <summary>
        /// Gets all visits.
        /// </summary>
        [HttpGet]
        [Authorize(Roles =("Admin,Receptionist"))]
        [ProducesResponseType(typeof(List<VisitDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<IEnumerable<VisitDTO>> GetAll()
        {
            List<VisitDTO> visits = _service.GetAll();

            return Ok(visits);
        }

        /// <summary>
        /// Gets visit by ID.
        /// </summary>
        [HttpGet("{id}", Name = "GetVisitById")]
        [Authorize(Roles =("Admin,Receptionist,Doctor"))]
        [ProducesResponseType(typeof(VisitDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<VisitDTO>> GetById(int id)
        {
            VisitDTO? visit = _service.GetById(id);

            if (visit == null)
                return NotFound($"Visit with ID = {id} was not found.");

            var authorizationResult = await _authorizationService.AuthorizeAsync(
    User,
    visit,
    "DoctorOwnResource");

            if (!authorizationResult.Succeeded &&
                !User.IsInRole("Admin") &&
                !User.IsInRole("Receptionist"))
            {
                return Forbid();
            }

            return Ok(visit);
        }
            
        

        /// <summary>
        /// Adds a new visit.
        /// </summary>
        [HttpPost]
        [Authorize(Roles =("Admin,Doctor"))]
        [ProducesResponseType(typeof(VisitDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<VisitDTO> Add(AddVisitDTO dto)
        {
            if (dto == null) return BadRequest("Invalid visit data."); int? currentEmployeeId = null; 
            if (User.IsInRole("Doctor"))  
            {
                var employeeIdClaim = User.FindFirst("EmployeeId");

                if (employeeIdClaim == null || !int.TryParse(employeeIdClaim.Value, out int employeeId)) 
                {
                    return Forbid();
                }

                currentEmployeeId = employeeId;
            }
            VisitResultDTO result = _service.Add(dto, currentEmployeeId);
            if (!result.Success)
            { 
                if (result.Message == "You are not authorized to create a visit for this appointment.")
                {
                    return Forbid(); 
                }
                return BadRequest(result.Message); 
            }

            VisitDTO? visit = _service.GetById(result.VisitId);


            return CreatedAtRoute("GetVisitById", new { id = result.VisitId }, visit);

        }


        /// <summary>
        /// Updates an existing visit.
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = ("Admin,Doctor"))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Update(int id, UpdateVisitDTO dto)
        {
            if (dto == null)
                return BadRequest("Invalid visit data.");

            VisitDTO? visit = _service.GetById(id);

            if (visit == null)
            {
                return NotFound($"Visit with ID = {id} was not found.");
            }

            var authorizationResult = await _authorizationService.AuthorizeAsync(
                User,
                visit,
                "DoctorOwnResource");

            if (!authorizationResult.Succeeded && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            string message = _service.Update(id, dto);

            if (message == "Visit not found.")
            {
                return NotFound(message);
            }

            if (message != "Visit updated successfully.")
            {
                return BadRequest(message);
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a visit.
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = ("Admin,Doctor"))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> Delete(int id)
        {
            VisitDTO? visit = _service.GetById(id);

            if (visit == null)
            {
                return NotFound($"Visit with ID = {id} was not found.");
            }

            var authorizationResult = await _authorizationService.AuthorizeAsync(
                User,
                visit,
                "DoctorOwnResource");

            if (!authorizationResult.Succeeded && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            string message = _service.Delete(id);

            if (message == "Visit not found.")
            {
                return NotFound(message);
            }

            if (message != "Visit deleted successfully.")
            {
                return BadRequest(message);
            }

            return NoContent();
        }
    }
}