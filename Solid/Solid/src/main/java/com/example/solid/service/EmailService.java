package com.example.solid.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class EmailService {

    private final String brevoApiKey;
    private final String fromEmail;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    public EmailService(
            @Value("${brevo.api.key}") String brevoApiKey,
            @Value("${spring.mail.from}") String fromEmail,
            RestTemplate restTemplate,
            ObjectMapper objectMapper) {
        this.brevoApiKey = brevoApiKey;
        this.fromEmail = fromEmail;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            sendEmailViaBrevoApi(to, subject, body);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send email to " + to + ": " + e.getMessage());
            // Don't throw - allow registration to continue
        }
    }

    private void sendEmailViaBrevoApi(String to, String subject, String body) throws Exception {
        // Build Brevo API request
        Map<String, Object> emailRequest = new HashMap<>();
        
        // From
        Map<String, String> sender = new HashMap<>();
        sender.put("name", "SolidDesign");
        sender.put("email", fromEmail);
        emailRequest.put("sender", sender);
        
        // To
        Map<String, String> recipient = new HashMap<>();
        recipient.put("email", to);
        emailRequest.put("to", List.of(recipient));
        
        // Subject and body
        emailRequest.put("subject", subject);
        emailRequest.put("htmlContent", "<html><body>" + body.replace("\n", "<br>") + "</body></html>");

        // Create HTTP headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        // Convert to JSON and send
        String jsonBody = objectMapper.writeValueAsString(emailRequest);
        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

        try {
            restTemplate.postForObject(BREVO_API_URL, entity, String.class);
            System.out.println("[EmailService] Email sent successfully to " + to + " via Brevo API");
        } catch (Exception e) {
            System.err.println("[EmailService] Brevo API error: " + e.getMessage());
            throw e;
        }
    }
}
