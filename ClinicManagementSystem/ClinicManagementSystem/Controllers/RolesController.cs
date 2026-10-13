using ClinicManagementSystem.Business.DTOs.RoleDTOs;
using ClinicManagementSystem.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagementSystem.Controllers
{
    [Authorize(Roles ="Admin")]
    [Route("api/ClinicManagementSystem/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly RoleService _service;

        public RolesController(RoleService service)
        {
            _service = service;
        }

        /// <summary>
        /// Gets all roles.
        /// </summary>
        /// <returns>List of roles.</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<RoleDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<IEnumerable<RoleDTO>> GetAll()
        {
            List<RoleDTO> roles = _service.GetAll();

            return Ok(roles);
        }

        /// <summary>
        /// Gets a role by ID.
        /// </summary>
        /// <param name="id">Role ID.</param>
        /// <returns>Role information.</returns>
        [HttpGet("{id}", Name = "GetRoleById")]
        [ProducesResponseType(typeof(RoleDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<RoleDTO> GetById(int id)
        {
            RoleDTO? role = _service.GetById(id);

            if (role == null)
            {
                return NotFound($"Role with ID = {id} was not found.");
            }

            return Ok(role);
        }

        /// <summary>
        /// Creates a new role.
        /// </summary>
        /// <param name="dto">Role information.</param>
        /// <returns>The newly created role.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(RoleDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public ActionResult<RoleDTO> Add(AddRoleDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.RoleName))
            {
                return BadRequest("Invalid role data.");
            }

            try
            {
                int roleId = _service.Add(dto);

                RoleDTO? role = _service.GetById(roleId);

                return CreatedAtAction(nameof(GetById), new { id = roleId }, role);
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
        /// Updates an existing role.
        /// </summary>
        /// <param name="id">Role ID.</param>
        /// <param name="dto">Updated role information.</param>
        /// <returns>No content if updated successfully.</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public ActionResult Update(int id, UpdateRoleDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.RoleName))
            {
                return BadRequest("Invalid role data.");
            }

            try
            {
                bool isUpdated = _service.Update(id, dto);

                if (!isUpdated)
                {
                    return NotFound($"Role with ID = {id} was not found.");
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
        ///// Deletes a role.
        ///// </summary>
        ///// <param name="id">Role ID.</param>
        ///// <returns>No content if deleted successfully.</returns>
        //[HttpDelete("{id}")]
        //[ProducesResponseType(StatusCodes.Status204NoContent)]
        //[ProducesResponseType(StatusCodes.Status404NotFound)]
        //[ProducesResponseType(StatusCodes.Status500InternalServerError)]
        //public ActionResult Delete(int id)
        //{
        //    bool isDeleted = _service.Delete(id);

        //    if (!isDeleted)
        //    {
        //        return NotFound($"Role with ID = {id} was not found.");
        //    }

        //    return NoContent();
        //}
    }
}