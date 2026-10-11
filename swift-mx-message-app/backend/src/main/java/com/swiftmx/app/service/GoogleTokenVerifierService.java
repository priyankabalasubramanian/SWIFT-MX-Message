package com.swiftmx.app.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Service
public class GoogleTokenVerifierService {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenVerifierService.class);
    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final String expectedClientId;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Autowired
    public GoogleTokenVerifierService(
            @Value("${google.client-id:}") String expectedClientId,
            ObjectMapper objectMapper) {
        this.expectedClientId = expectedClientId != null ? expectedClientId.trim() : "";
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    // Protected constructor for unit testing injection if needed
    public GoogleTokenVerifierService(String expectedClientId, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.expectedClientId = expectedClientId != null ? expectedClientId.trim() : "";
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public GoogleUserInfo verify(String idToken) {
        if (idToken == null || idToken.trim().isEmpty()) {
            throw new BadCredentialsException("Google ID token is required");
        }

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    GOOGLE_TOKENINFO_URL + idToken.trim(), String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new BadCredentialsException("Google authentication token verification failed");
            }

            JsonNode payload = objectMapper.readTree(response.getBody());

            String email = payload.path("email").asText(null);
            if (email == null || email.trim().isEmpty()) {
                throw new BadCredentialsException("No email associated with Google token");
            }

            // Ensure email was verified by Google
            String emailVerified = payload.path("email_verified").asText("false");
            if (!"true".equalsIgnoreCase(emailVerified)) {
                throw new BadCredentialsException("Google account email is not verified");
            }

            // Verify audience if a Google client ID is configured
            if (!expectedClientId.isEmpty()) {
                String aud = payload.path("aud").asText("");
                if (!expectedClientId.equals(aud)) {
                    log.error("Google token audience mismatch. Expected: {}, Received: {}", expectedClientId, aud);
                    throw new BadCredentialsException("Google token client ID mismatch");
                }
            }

            // Verify token issuer
            String iss = payload.path("iss").asText("");
            if (!"accounts.google.com".equals(iss) && !"https://accounts.google.com".equals(iss)) {
                throw new BadCredentialsException("Invalid Google token issuer: " + iss);
            }

            String name = payload.path("name").asText(email.split("@")[0]);
            String sub = payload.path("sub").asText("");

            return new GoogleUserInfo(email.trim().toLowerCase(), name, sub);

        } catch (HttpStatusCodeException ex) {
            log.warn("Google tokeninfo returned HTTP error: {}", ex.getStatusCode());
            throw new BadCredentialsException("Invalid or expired Google authentication token");
        } catch (BadCredentialsException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error validating Google ID token: {}", ex.getMessage());
            throw new BadCredentialsException("Unable to verify Google authentication token: " + ex.getMessage());
        }
    }

    public record GoogleUserInfo(String email, String name, String sub) {}
}
