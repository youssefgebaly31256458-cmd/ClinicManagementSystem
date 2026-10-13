using ClinicManagementSystem.Business.DTOs;
using ClinicManagementSystem.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagementSystem.Controllers
{
    [Authorize]
    [Route("api/ClinicManagementSystem/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {


        private readonly EmployeeService _service;

        public EmployeesController(EmployeeService service)
        {
            _service = service;
        }

        /// <summary>
        /// Gets all employees.
        /// </summary>
        /// <returns>List of employees.</returns>
        
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(List<EmployeeDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<IEnumerable<EmployeeDTO>> GetAll()
        {
            List<EmployeeDTO> employees = _service.GetAll();

            return Ok(employees);
        }

        /// <summary>
        /// Gets an employee by ID.
        /// </summary>
        /// <param name="id">Employee ID.</param>
        /// <returns>Employee information.</returns>
        [HttpGet("{id}", Name = "GetEmployeeById")]
        [Authorize(Roles = "Admin,Doctor")]
        [ProducesResponseType(typeof(EmployeeDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<EmployeeDTO> GetById(int id)
        {
            if (User.IsInRole("Admin"))
            {
                EmployeeDTO? employee = _service.GetById(id);

                if (employee == null)
                {
                    return NotFound($"Employee with ID = {id} was not found.");
                }
                return Ok(employee);
            }

            var employeeIdClaim = User.FindFirst("EmployeeId");

            if (employeeIdClaim == null || !int.TryParse(employeeIdClaim.Value, out int CurrentEmployeeId)) 
            {
                return Forbid();
            }
            if (CurrentEmployeeId != id)
            {
                return Forbid();
            }

            EmployeeDTO? doctorEmployee = _service.GetById(id);

            if (doctorEmployee == null)
            {
                return NotFound($"Employee with ID = {id} was not found.");
            }

            return Ok(doctorEmployee);
        }

        /// <summary>
        /// Creates a new employee.
        /// </summary>
        /// <param name="dto">Employee information.</param>
        /// <returns>The newly created employee.</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(EmployeeDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<EmployeeDTO> Add(AddEmployeeDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Invalid employee data.");
            }


            int employeeId = _service.Add(dto);

            if (employeeId == -1)
            {
                return BadRequest("Email already exists.");
            }

            EmployeeDTO? employee = _service.GetById(employeeId);

            return CreatedAtAction(
                nameof(GetById),
                new { id = employeeId },
                employee);
        }

        /// <summary>
        /// Updates an existing employee.
        /// </summary>
        /// <param name="id">Employee ID.</param>
        /// <param name="dto">Updated employee information.</param>
        /// <returns>No content if updated successfully.</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult Update(int id, UpdateEmployeeDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Invalid employee data.");
            }

            string message = _service.Update(id, dto);

            if (message == "Employee not Found.")
            {
                return NotFound(message);
            }
            if (message == "Email alreade Exists.")
            {
                return BadRequest(message);
            }


            return NoContent();
        }

        /// <summary>
        /// Deletes an employee.
        /// </summary>
        /// <param name="id">Employee ID.</param>
        /// <returns>No content if deleted successfully.</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult Delete(int id)
        {
            bool isDeleted = _service.Delete(id);

            if (!isDeleted)
            {
                return NotFound($"Employee with ID = {id} was not found.");
            }

            return NoContent();
        }

        /// <summary>
        /// Retrieves employees that are not assigned as doctors.
        /// </summary>
        [HttpGet("AvailableForDoctor")]
        [Authorize(Roles = "Admin,Receptionist")]
        [ProducesResponseType(typeof(List<EmployeeDTO>), StatusCodes.Status200OK)]
        public ActionResult<IEnumerable<EmployeeDTO>> GetAvailableForDoctor()
        {
            var employees = _service.GetAvailableForDoctor();
            return Ok(employees);
        }
    }
}
