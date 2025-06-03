using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly string _systemEmail;
        private readonly string _appPassword;
        private readonly string _displayName;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _systemEmail = _configuration["EmailSettings:SystemEmail"];
            _appPassword = _configuration["EmailSettings:AppPassword"];
            _displayName = _configuration["EmailSettings:DisplayName"];
        }

        public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetToken)
        {
            try
            {
                var smtpClient = new SmtpClient
                {
                    Host = "smtp.gmail.com",
                    Port = 587,
                    EnableSsl = true,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(_systemEmail, _appPassword)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_systemEmail, _displayName),
                    To = { new MailAddress(toEmail) },
                    Subject = "Reset Password - PC Parts Store",
                    Body = GetPasswordResetEmailBody(toEmail, resetToken),
                    IsBodyHtml = true
                };

                await smtpClient.SendMailAsync(mailMessage);
                _logger.LogInformation($"Password reset email sent to {toEmail}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send password reset email: {ex.Message}");
                return false;
            }
        }

        private string GetPasswordResetEmailBody(string userEmail, string resetToken)
        {
            var resetLink = $"{_configuration["ApplicationSettings:FrontendUrl"]}/reset-password?token={resetToken}";

            return $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2>Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset the password for your account ({userEmail}).</p>
                    <p>Click the button below to reset your password:</p>
                    <p style='text-align: center;'>
                        <a href='{resetLink}' 
                           style='background-color: #4CAF50; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;'>
                            Reset Password
                        </a>
                    </p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>Best regards,<br>PC Parts Store Team</p>
                </div>";
        }
    }
}