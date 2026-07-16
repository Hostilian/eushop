package com.eushop.core.notification;

import com.eushop.core.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Map;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public EmailNotificationService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    /**
     * Send email notification
     * @param user Recipient user
     * @param title Notification title
     * @param message Notification message
     * @param url URL to include in email
     */
    @Async("notificationExecutor")
    public void sendEmailNotification(User user, String title, String message, String url) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // Set email properties
            helper.setTo(user.getEmail());
            helper.setSubject(title);
            helper.setFrom("noreply@eushop.com");

            // Create email context
            Context context = new Context();
            context.setVariable("user", user);
            context.setVariable("title", title);
            context.setVariable("message", message);
            context.setVariable("url", url);

            // Process template
            String htmlContent = templateEngine.process("notification-email", context);
            helper.setText(htmlContent, true);

            // Send email
            mailSender.send(mimeMessage);
            logger.info("Successfully sent email notification to user {}", user.getId());
        } catch (MessagingException e) {
            logger.error("Failed to send email notification to user {}: {}", user.getId(), e.getMessage());
        } catch (Exception e) {
            logger.error("Error sending email notification to user {}: {}", user.getId(), e.getMessage());
        }
    }

    /**
     * Send email notification with custom template
     * @param user Recipient user
     * @param title Notification title
     * @param message Notification message
     * @param url URL to include in email
     * @param templateName Template name
     * @param variables Additional template variables
     */
    @Async("notificationExecutor")
    public void sendEmailNotification(User user, String title, String message, String url,
                                     String templateName, Map<String, Object> variables) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // Set email properties
            helper.setTo(user.getEmail());
            helper.setSubject(title);
            helper.setFrom("noreply@eushop.com");

            // Create email context
            Context context = new Context();
            context.setVariable("user", user);
            context.setVariable("title", title);
            context.setVariable("message", message);
            context.setVariable("url", url);

            // Add additional variables
            if (variables != null) {
                variables.forEach(context::setVariable);
            }

            // Process template
            String htmlContent = templateEngine.process(templateName, context);
            helper.setText(htmlContent, true);

            // Send email
            mailSender.send(mimeMessage);
            logger.info("Successfully sent email notification to user {}", user.getId());
        } catch (MessagingException e) {
            logger.error("Failed to send email notification to user {}: {}", user.getId(), e.getMessage());
        } catch (Exception e) {
            logger.error("Error sending email notification to user {}: {}", user.getId(), e.getMessage());
        }
    }
}