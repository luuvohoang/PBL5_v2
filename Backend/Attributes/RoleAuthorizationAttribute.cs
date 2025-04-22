using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Backend.Attributes
{
    public class RoleAuthorizationAttribute : ActionFilterAttribute
    {
        private readonly string[] _allowedRoles;

        public RoleAuthorizationAttribute(params string[] roles)
        {
            _allowedRoles = roles;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            try
            {
                var userRole = context.HttpContext.Request.Headers["UserRole"].ToString();

                if (string.IsNullOrEmpty(userRole))
                {
                    context.Result = new UnauthorizedObjectResult(new { message = "No role provided" });
                    return;
                }

                if (!_allowedRoles.Contains(userRole))
                {
                    context.Result = new UnauthorizedObjectResult(new
                    {
                        message = $"Role {userRole} is not authorized. Allowed roles: {string.Join(", ", _allowedRoles)}"
                    });
                    return;
                }
            }
            catch (Exception ex)
            {
                context.Result = new UnauthorizedObjectResult(new { message = $"Authorization error: {ex.Message}" });
                return;
            }

            base.OnActionExecuting(context);
        }
    }
}
