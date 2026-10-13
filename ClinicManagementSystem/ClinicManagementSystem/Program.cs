using ClinicManagementSystem.Authorization;
using ClinicManagementSystem.Business.Services;
using ClinicManagementSystem.DataAccess.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace ClinicManagementSystem
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // =========================================
            // Add services to the container
            // =========================================

            builder.Services.AddControllers();

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter your JWT token."
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });


            // =========================================
            // JWT Authentication Configuration
            // =========================================

            builder.Services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        // Validate that the token was issued by our API
                        ValidateIssuer = true,

                        // Validate that the token is intended for our API/client
                        ValidateAudience = true,

                        // Validate that the token has not expired
                        ValidateLifetime = true,

                        // Validate the token's signature
                        ValidateIssuerSigningKey = true,

                        // Read the expected issuer from appsettings.json
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],

                        // Read the expected audience from appsettings.json
                        ValidAudience = builder.Configuration["Jwt:Audience"],

                        // Read the secret key from appsettings.json
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(
                                builder.Configuration["Jwt:Key"]!))
                    };

                    // =========================================
                    // JWT Debugging
                    // =========================================

                    options.Events = new JwtBearerEvents
                    {
                        OnAuthenticationFailed = context =>
                        {
                            Console.WriteLine("JWT AUTHENTICATION FAILED:");
                            Console.WriteLine(context.Exception.Message);

                            return Task.CompletedTask;
                        },

                        OnTokenValidated = context =>
                        {
                            Console.WriteLine("JWT TOKEN VALIDATED SUCCESSFULLY");

                            return Task.CompletedTask;
                        }
                    };
                });


            // =========================================
            // Authorization Configuration
            // =========================================

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("DoctorOwnResource", policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.AddRequirements(new DoctorOwnResourceRequirement());
                });
            });

            builder.Services.AddScoped<IAuthorizationHandler, DoctorOwnResourceHandler>();


            // =========================================
            // Database Configuration
            // =========================================

            builder.Services.AddDbContext<ClinicDbContext>(options =>
            {
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("ClinicConnection"));

                if (builder.Environment.IsDevelopment())
                {
                    options.LogTo(Console.WriteLine, LogLevel.Information)
                           .EnableSensitiveDataLogging()
                           .EnableDetailedErrors();
                }
            });


            // =========================================
            // CORS Configuration
            // =========================================

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ReactPolicy", policy =>
                {
                    policy
                        .SetIsOriginAllowed(origin =>
                            origin == "http://localhost:5173" ||
                            origin.EndsWith(".ngrok-free.dev"))
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });


            // =========================================
            // Dependency Injection - Services
            // =========================================

            builder.Services.AddScoped<SpecializationService>();
            builder.Services.AddScoped<EmployeeService>();
            builder.Services.AddScoped<DoctorService>();
            builder.Services.AddScoped<PatientService>();
            builder.Services.AddScoped<RoleService>();
            builder.Services.AddScoped<UserService>();
            builder.Services.AddScoped<AppointmentService>();
            builder.Services.AddScoped<VisitService>();
            builder.Services.AddScoped<PrescriptionService>();

            builder.Services.AddScoped<AuthenticationService>();
            builder.Services.AddScoped<JwtService>();


            // =========================================
            // Rate Limiting Configuration
            // =========================================

            builder.Services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.AddPolicy("AuthLimiter", httpContext =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 5,
                            Window = TimeSpan.FromMinutes(1),
                            QueueLimit = 0
                        }));
            });


            // =========================================
            // Build Application
            // =========================================

            var app = builder.Build();


            // =========================================
            // HTTP Request Pipeline
            // =========================================

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseHttpsRedirection();

            app.UseCors("ReactPolicy");

            app.UseRateLimiter();


            // =========================================
            // Authentication & Authorization
            // =========================================

            // Reads and validates the JWT from the Authorization header
            app.UseAuthentication();

            // Centralized 403 Forbidden logging middleware
            app.Use(async (context, next) =>
            {
                await next();

                if (context.Response.StatusCode == StatusCodes.Status403Forbidden)
                {
                    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
                    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
                    var path = context.Request.Path.Value ?? "unknown";

                    logger.LogWarning("Forbidden (403) access attempt to {Path} from IP {IP}. User: {UserId}", path, ip, userId);
                }
            });

            // Checks whether the authenticated user
            // has permission to access the requested resource
            app.UseAuthorization();


            // =========================================
            // Controllers
            // =========================================

            app.MapControllers();


            // =========================================
            // React SPA Fallback
            // =========================================

            app.MapFallbackToFile("index.html");


            // =========================================
            // Run Application
            // =========================================

            app.Run();
        }
    }
}