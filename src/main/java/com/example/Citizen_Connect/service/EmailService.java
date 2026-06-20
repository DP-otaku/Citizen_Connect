package com.example.Citizen_Connect.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendVerificationEmail(String toEmail, String name, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Citizen Connect 2.0 — Verify Your Email");
            helper.setText(buildHtml(name, baseUrl + "/api/auth/verify?token=" + token), true);

            mailSender.send(message);
            log.info("Verification email sent to {}", toEmail);
        } catch (MessagingException ex) {
            log.error("Failed to send email to {}: {}", toEmail, ex.getMessage());
        }
    }

    private String buildHtml(String name, String link) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <style>
                    * { margin:0; padding:0; box-sizing:border-box; }
                    body { font-family:Arial,sans-serif; background:#0f172a; }
                    .wrap { max-width:600px; margin:40px auto; }
                    .card { background:#1e293b; border-radius:16px; overflow:hidden;
                            border:1px solid rgba(14,165,233,0.2); }
                    .header { background:linear-gradient(135deg,#0369a1,#0891b2);
                              padding:40px; text-align:center; }
                    .header h1 { font-size:26px; color:#fff; margin-bottom:6px; }
                    .header p  { color:rgba(255,255,255,.8); font-size:14px; }
                    .body { padding:40px; }
                    .body p { color:#94a3b8; line-height:1.7; margin-bottom:16px; }
                    .body strong { color:#e2e8f0; }
                    .btn-wrap { text-align:center; margin:32px 0; }
                    .btn { display:inline-block; background:linear-gradient(135deg,#0ea5e9,#06b6d4);
                           color:#fff; padding:16px 40px; border-radius:10px;
                           text-decoration:none; font-weight:bold; font-size:16px; }
                    .note { font-size:13px; color:#64748b; }
                    .footer { text-align:center; padding:24px; color:#475569; font-size:12px;
                              border-top:1px solid #334155; }
                  </style>
                </head>
                <body>
                  <div class="wrap">
                    <div class="card">
                      <div class="header">
                        <h1>🌊 Citizen Connect 2.0</h1>
                        <p>Disaster Assistance Platform</p>
                      </div>
                      <div class="body">
                        <p>Hello, <strong>%s</strong>!</p>
                        <p>Thank you for joining <strong>Citizen Connect 2.0</strong>.</p>
                        <p>Click the button below to verify your email and activate your account:</p>
                        <div class="btn-wrap">
                          <a href="%s" class="btn">✅ Verify Email Address</a>
                        </div>
                        <p class="note">This link expires in <strong>24 hours</strong>.
                           If you didn't create this account, ignore this email.</p>
                      </div>
                      <div class="footer">
                        <p>© 2024 Citizen Connect 2.0 | Disaster Assistance Platform</p>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(name, link);
    }
}
