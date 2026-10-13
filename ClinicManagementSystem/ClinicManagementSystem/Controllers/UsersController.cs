using ClinicManagementSystem.Business.DTOs.UserDTOs;
using ClinicManagementSystem.Business.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ClinicManagementSystem.Controllers
{
    [Authorize]
    [Route("api/ClinicManagementSystem/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserService _service;
        private readonly ILogger<UsersController> _logger;
        private readonly IWebHostEnvironment _env;

        public UsersController(UserService service, ILogger<UsersController> logger, IWebHostEnvironment env)
        {
            _service = service;
            _logger = logger;
            _env = env;
        }

        /// <summary>
        /// Gets all users.
        /// </summary>
        /// <returns>List of users.</returns>
        [HttpGet]
        [Authorize(Roles ="Admin")]
        [ProducesResponseType(typeof(List<UserDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<IEnumerable<UserDTO>> GetAll()
        {
            List<UserDTO> users = _service.GetAll();

            return Ok(users);
        }

        /// <summary>
        /// Gets a user by ID.
        /// </summary>
        /// <param name="id">User ID.</param>
        /// <returns>User information.</returns>
        [HttpGet("{id}", Name = "GetUserById")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(UserDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult<UserDTO> GetById(int id)
        {
            UserDTO? user = _service.GetById(id);

            if (user == null)
            {
                return NotFound($"User with ID = {id} was not found.");
            }

            return Ok(user);
        }

        /// <summary>
        /// Creates a new user.
        /// </summary>
        /// <param name="dto">User information.</param>
        /// <returns>The newly created user.</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(UserDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public ActionResult<UserDTO> Add(AddUserDTO dto)
        {
            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            if (dto == null || string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
            {
                _logger.LogWarning("Admin {AdminId} attempted to create user with invalid data from IP {IP}. Outcome: BadRequest", adminId, ip);
                return BadRequest("Invalid user data.");
            }

            try
            {
                int userId = _service.Add(dto);

                UserDTO? user = _service.GetById(userId);

                _logger.LogInformation("Admin {AdminId} created user with ID {TargetUserId} from IP {IP}. Outcome: Success", adminId, userId, ip);

                return CreatedAtAction(nameof(GetById), new { id = userId }, user);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Admin {AdminId} failed to create user from IP {IP}. Outcome: Conflict ({Message})", adminId, ip, ex.Message);
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Updates an existing user.
        /// </summary>
        /// <param name="id">User ID.</param>
        /// <param name="dto">Updated user information.</param>
        /// <returns>No content if updated successfully.</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public ActionResult Update(int id, UpdateUserDTO dto)
        {
            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            if (dto == null || string.IsNullOrWhiteSpace(dto.Username))
            {
                _logger.LogWarning("Admin {AdminId} attempted to update user ID {TargetUserId} with invalid data from IP {IP}. Outcome: BadRequest", adminId, id, ip);
                return BadRequest("Invalid user data.");
            }

            try
            {
                bool isUpdated = _service.Update(id, dto);

                if (!isUpdated)
                {
                    _logger.LogWarning("Admin {AdminId} attempted to update non-existent user with ID {TargetUserId} from IP {IP}. Outcome: NotFound", adminId, id, ip);
                    return NotFound($"User with ID = {id} was not found.");
                }

                _logger.LogInformation("Admin {AdminId} updated user with ID {TargetUserId} from IP {IP}. Outcome: Success", adminId, id, ip);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Admin {AdminId} failed to update user with ID {TargetUserId} from IP {IP}. Outcome: Conflict ({Message})", adminId, id, ip, ex.Message);
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Deletes a user.
        /// </summary>
        /// <param name="id">User ID.</param>
        /// <returns>No content if deleted successfully.</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public ActionResult Delete(int id)
        {
            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "unknown";
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

            bool isDeleted = _service.Delete(id);

            if (!isDeleted)
            {
                _logger.LogWarning("Admin {AdminId} attempted to delete non-existent user with ID {TargetUserId} from IP {IP}. Outcome: NotFound", adminId, id, ip);
                return NotFound($"User with ID = {id} was not found.");
            }

            _logger.LogInformation("Admin {AdminId} deleted user with ID {TargetUserId} from IP {IP}. Outcome: Success", adminId, id, ip);
            return NoContent();
        }

        /// <summary>
        /// Gets the profile of the currently authenticated user.
        /// </summary>
        [HttpGet("MyProfile")]
        [Authorize]
        [ProducesResponseType(typeof(MyProfileDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<MyProfileDTO> GetMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Forbid();
            }

            MyProfileDTO? profile = _service.GetMyProfile(userId);

            if (profile == null)
            {
                return NotFound("User profile not found.");
            }
            return Ok(profile);
        }


        /// <summary>
        /// Updates the profile of the currently authenticated user.
        /// </summary>
        /// <param name="dto">Updated profile information.</param>
        /// <returns>No content if the profile was updated successfully.</returns>
        [HttpPut("MyProfile")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult UpdateMyProfile(UpdateMyProfileDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Invalid profile data.");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Forbid();
            }


            bool isUpdate = _service.UpdateMyProfile(userId, dto);

            if (!isUpdate)
            {
                return NotFound("User profile not found.");
            }

            return NoContent();
        }

        /// <summary>
        /// Uploads and sets the profile photo for the currently authenticated user.
        /// </summary>
        [HttpPost("MyProfile/Photo")]
        [Authorize]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UploadProfilePhoto(IFormFile? file)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Forbid();
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest("No image file provided.");
            }

            // Enforce maximum file size: 5 MB (5 * 1024 * 1024 bytes)
            const long maxFileSize = 5 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                return BadRequest("Image file size exceeds the 5 MB limit.");
            }

            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                ".jpg", ".jpeg", ".png", ".webp"
            };

            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                return BadRequest("Invalid image extension. Only JPG, JPEG, PNG, and WEBP are supported.");
            }

            // Deep binary inspection (magic bytes) to guarantee the file is truly a valid image
            using var stream = file.OpenReadStream();
            if (!IsValidImageHeader(stream, out var detectedExtension))
            {
                return BadRequest("File content is not a valid or supported image (JPG, PNG, WEBP).");
            }

            // Target storage directory: wwwroot/uploads/profile-images
            var webRoot = _env.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRoot))
            {
                webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
            }

            var profileImagesDir = Path.Combine(webRoot, "uploads", "profile-images");
            Directory.CreateDirectory(profileImagesDir);

            // Generate unique GUID filename with canonical detected extension
            var uniqueFileName = $"{Guid.NewGuid():N}{detectedExtension}";
            var physicalPath = Path.Combine(profileImagesDir, uniqueFileName);

            // Save new physical file first
            try
            {
                stream.Position = 0;
                using (var outputStream = new FileStream(physicalPath, FileMode.Create, FileAccess.Write))
                {
                    await stream.CopyToAsync(outputStream);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save profile photo to disk at {Path}", physicalPath);
                return StatusCode(StatusCodes.Status500InternalServerError, "Failed to save image file.");
            }

            // Relative public URL (never store absolute domain in DB)
            var publicUrl = $"/uploads/profile-images/{uniqueFileName}";

            // Update database record
            var (success, oldPhotoUrl) = _service.UpdateProfilePhoto(userId, publicUrl);
            if (!success)
            {
                // If database update fails, safely clean up newly saved physical file
                try
                {
                    if (System.IO.File.Exists(physicalPath))
                    {
                        System.IO.File.Delete(physicalPath);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to clean up newly saved photo after DB failure: {Path}", physicalPath);
                }

                return NotFound("User profile not found.");
            }

            // Only after successful save and DB update, safely clean up old file if applicable
            TryDeleteOldProfilePhoto(oldPhotoUrl, profileImagesDir, uniqueFileName);

            return Ok(new { photoUrl = publicUrl });
        }

        private static bool IsValidImageHeader(Stream stream, out string detectedExtension)
        {
            detectedExtension = string.Empty;
            if (stream == null || stream.Length < 12)
            {
                return false;
            }

            long originalPosition = stream.Position;
            try
            {
                stream.Position = 0;
                byte[] header = new byte[12];
                int bytesRead = stream.Read(header, 0, 12);
                if (bytesRead < 12)
                {
                    return false;
                }

                // JPEG / JPG: FF D8 FF
                if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
                {
                    detectedExtension = ".jpg";
                    return true;
                }

                // PNG: 89 50 4E 47 0D 0A 1A 0A
                if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47 &&
                    header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A)
                {
                    detectedExtension = ".png";
                    return true;
                }

                // WEBP: RIFF....WEBP (0-3: RIFF, 8-11: WEBP)
                if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
                    header[8] == 0x57 && header[9] == 0x42 && header[10] == 0x50)
                {
                    detectedExtension = ".webp";
                    return true;
                }

                return false;
            }
            finally
            {
                stream.Position = originalPosition;
            }
        }

        private void TryDeleteOldProfilePhoto(string? oldPhotoUrl, string profileImagesDirectory, string newFileName)
        {
            if (string.IsNullOrWhiteSpace(oldPhotoUrl))
            {
                return;
            }

            try
            {
                var normalizedUrl = oldPhotoUrl.Trim().Replace('\\', '/');

                if (!normalizedUrl.StartsWith("/uploads/profile-images/", StringComparison.OrdinalIgnoreCase))
                {
                    return;
                }

                var oldFileName = Path.GetFileName(normalizedUrl);
                if (string.IsNullOrWhiteSpace(oldFileName) ||
                    string.Equals(oldFileName, newFileName, StringComparison.OrdinalIgnoreCase))
                {
                    return;
                }

                var fullTargetDir = Path.GetFullPath(profileImagesDirectory);
                var oldFilePath = Path.GetFullPath(Path.Combine(fullTargetDir, oldFileName));

                // Path traversal check: must stay strictly inside target directory
                if (!oldFilePath.StartsWith(fullTargetDir, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("Potential path traversal blocked when attempting to delete old profile photo: {Path}", oldFilePath);
                    return;
                }

                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                    _logger.LogInformation("Safely deleted previous profile image at {Path}", oldFilePath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete previous profile image: {PhotoUrl}", oldPhotoUrl);
            }
        }

    }
}
