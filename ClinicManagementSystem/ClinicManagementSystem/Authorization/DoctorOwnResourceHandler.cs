using Microsoft.AspNetCore.Authorization;
using ClinicManagementSystem.Business;

namespace ClinicManagementSystem.Authorization
{
    public class DoctorOwnResourceHandler
        : AuthorizationHandler<DoctorOwnResourceRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            DoctorOwnResourceRequirement requirement)
        {
            var employeeIdClaim = context.User.FindFirst("EmployeeId");

            if (employeeIdClaim == null)
            {
                return Task.CompletedTask;
            }

            if (!int.TryParse(employeeIdClaim.Value, out int employeeId))
            {
                return Task.CompletedTask;
            }

            if (context.Resource is not IOwnedResource resource)
            {
                return Task.CompletedTask;
            }

            if (resource.EmployeeId == employeeId)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}