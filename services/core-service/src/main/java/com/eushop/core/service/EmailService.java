package com.eushop.core.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendEmail(String to, String subject, String body) {
        // In a real implementation, this would use a service like SendGrid or AWS SES.
        // For now, we'll just log the email to the console.
        logger.info("Sending email to: {}", to);
        logger.info("Subject: {}", subject);
        logger.info("Body: {}", body);
    }
}
