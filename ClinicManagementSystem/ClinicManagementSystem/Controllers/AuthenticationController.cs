using ClinicManagementSystem.Business.DTOs.AuthenticationDTOs;
using ClinicManagementSystem.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace ClinicManagementSystem.Controllers
{
    /// <summary>
    /// Provides endpoints for user authentication and account security.
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly AuthenticationService _service;
        private readonly ILogger<AuthenticationController> _logger;

        public AuthenticationController(
            AuthenticationService service,
            ILogger<AuthenticationController> logger)
        {
            _service = service;
            _logger = logger;
        }

        /// <summary>
        /// Authenticates a user using their email and password.
        /// </summary>
        /// <param name="dto">
        /// Contains the user's email and password.
        /// </param>
        /// <returns>
        /// The authenticated user's information if the credentials are valid.
        /// </returns>
        /// <response code="200">
        /// User authenticated successfully.
        /// </response>
        /// <response code="401">
        /// The provided email or password is incorrect.
        /// </response>
        [HttpPost]
        [AllowAnonymous]
        [EnableRateLimiting("AuthLimiter")]
        [ProducesResponseType(typeof(LoginResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Login(LoginDTO dto)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                _logger.LogWarning("Failed login attempt from IP {IP}. Reason: Missing email or password", ip);
                return BadRequest("Email and password are required.");
            }

            var result = _service.Login(dto.Email, dto.Password);

            if (result == null)
            {
                var existingUser = _service.GetUserByEmail(dto.Email);
                string failureReason = existingUser == null
                    ? "User not found"
                    : !existingUser.IsActive
                        ? "Inactive user"
                        : "Invalid password";

                _logger.LogWarning("Failed login attempt for {Email} from IP {IP}. Reason: {Reason}", dto.Email, ip, failureReason);
                return Unauthorized("Email Or Password Is Wrong");
            }

            var user = result.User;

            _logger.LogInformation("Successful login for user {UserId} ({Email}) from IP {IP}", user.UserId, user.Employee?.Email ?? dto.Email, ip);

            LoginResponseDTO response = new LoginResponseDTO
            {
                UserId = user.UserId,
                EmployeeId = user.EmployeeId,
                Name = user.UserName,
                Email = user.Employee.Email,
                RoleId = user.RoleId,
                RoleName = user.Role.RoleName,
                Token = result.Token
            };

            return Ok(response);
        }

        /// <summary>
        /// Changes the password of a user.
        /// </summary>
        /// <param name="userId">
        /// The unique identifier of the user whose password will be changed.
        /// </param>
        /// <param name="dto">
        /// Contains the current password and the new password.
        /// </param>
        /// <returns>
        /// A success message if the password was changed successfully.
        /// </returns>
        /// <response code="200">
        /// Password changed successfully.
        /// </response>
        /// <response code="400">
        /// The current password is incorrect or the specified user does not exist.
        /// </response>
        [Authorize]
        [HttpPut("change-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult ChangePassword(ChangePasswordDTO dto)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            if (dto == null ||
                string.IsNullOrWhiteSpace(dto.CurrentPassword) ||
                string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                _logger.LogWarning("Failed password change attempt from IP {IP}. Reason: Invalid password data", ip);
                return BadRequest("Invalid password data.");
            }

            string? userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null)
            {
                _logger.LogWarning("Unauthorized password change attempt from IP {IP}. Reason: Missing user ID claim", ip);
                return Unauthorized();
            }

            if (!int.TryParse(userIdClaim, out int userId))
            {
                _logger.LogWarning("Unauthorized password change attempt from IP {IP}. Reason: Invalid user ID claim format", ip);
                return Unauthorized();
            }

            bool result = _service.ChangePassword(
                userId,
                dto.CurrentPassword,
                dto.NewPassword);

            if (!result)
            {
                _logger.LogWarning("Failed password change attempt for user {UserId} from IP {IP}. Reason: Invalid current password or user not found", userId, ip);
                return BadRequest("Invalid current password or user not found.");
            }

            _logger.LogInformation("Password successfully changed for user {UserId} from IP {IP}", userId, ip);
            return Ok("Password changed successfully.");
        }

        /// <summary>
        /// Generates a new access token using a valid refresh token.
        /// </summary>
        /// <param name="dto">
        /// Contains the refresh token.
        /// </param>
        /// <returns>
        /// A new access token if the refresh token is valid and not expired.
        /// </returns>
        /// <response code="200">
        /// Token refreshed successfully.
        /// </response>
        /// <response code="400">
        /// The refresh token is required.
        /// </response>
        /// <response code="401">
        /// The refresh token is invalid or expired.
        /// </response>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        [EnableRateLimiting("AuthLimiter")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult RefreshToken(RefreshTokenDTO dto)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            if (dto == null || string.IsNullOrWhiteSpace(dto.RefreshToken))
            {
                _logger.LogWarning("Failed refresh token attempt from IP {IP}. Reason: Missing refresh token", ip);
                return BadRequest("Refresh token is required.");
            }

            var result = _service.RefreshToken(dto.RefreshToken);

            if (result == null)
            {
                var user = _service.GetUserByRefreshToken(dto.RefreshToken);
                if (user == null)
                {
                    _logger.LogWarning("Failed refresh token attempt from IP {IP}. Reason: Invalid or nonexistent refresh token", ip);
                }
                else if (!user.IsActive)
                {
                    _logger.LogWarning("Failed refresh token attempt for user {UserId} ({Email}) from IP {IP}. Reason: Inactive user",
                        user.UserId, user.Employee?.Email ?? "unknown", ip);
                }
                else if (user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                {
                    _logger.LogWarning("Failed refresh token attempt for user {UserId} ({Email}) from IP {IP}. Reason: Expired refresh token",
                        user.UserId, user.Employee?.Email ?? "unknown", ip);
                }
                else
                {
                    _logger.LogWarning("Failed refresh token attempt from IP {IP}. Reason: Validation failure", ip);
                }

                return Unauthorized("Invalid or expired refresh token.");
            }

            _logger.LogInformation("Successful refresh token rotation for user {UserId} ({Email}) from IP {IP}",
                result.User.UserId, result.User.Employee?.Email ?? "unknown", ip);

            return Ok(new
            {
                token = result.Token,
                refreshToken = result.RefreshToken
            });
        }

        /// <summary>
        /// Logs out the user by revoking their refresh token.
        /// </summary>
        /// <param name="dto">
        /// Contains the refresh token to revoke.
        /// </param>
        /// <returns>
        /// A success message if the refresh token was revoked successfully.
        /// </returns>
        /// <response code="200">
        /// Logged out successfully.
        /// </response>
        /// <response code="400">
        /// The refresh token is required or invalid.
        /// </response>
        [HttpPost("logout")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Logout(RefreshTokenDTO dto)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            if (dto == null || string.IsNullOrWhiteSpace(dto.RefreshToken))
            {
                _logger.LogWarning("Failed logout attempt from IP {IP}. Reason: Missing refresh token", ip);
                return BadRequest("Refresh token is required.");
            }

            bool result = _service.Logout(dto.RefreshToken);

            if (!result)
            {
                _logger.LogWarning("Failed logout attempt from IP {IP}. Reason: Invalid refresh token or user not found", ip);
                return BadRequest("Invalid refresh token or user not found.");
            }

            _logger.LogInformation("User logged out successfully from IP {IP}", ip);
            return Ok("Logged out successfully.");
        }

    }
}