package com.example.solid.Config;

import org.springframework.context.annotation.Configuration;

/**
 * DEPRECATED: Using Brevo API instead of SMTP JavaMailSender
 * This config is kept for reference only. Email is now sent via Brevo REST API.
 */
@Configuration
public class MailConfig {
    // Disabled - using Brevo API in EmailService instead
}

