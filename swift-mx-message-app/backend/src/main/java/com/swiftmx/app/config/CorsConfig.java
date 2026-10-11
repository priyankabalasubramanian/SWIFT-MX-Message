package com.swiftmx.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.*;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:}")
    private String allowedOrigins;

    @Value("${FRONTEND_ORIGIN:}")
    private String frontendOrigin;

    @Value("${FRONTEND_URL:}")
    private String frontendUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);

        Set<String> originPatterns = new LinkedHashSet<>();

        // Always preserve local development origins
        originPatterns.add("http://localhost:5173");
        originPatterns.add("http://localhost:5174");
        originPatterns.add("http://localhost:3000");
        originPatterns.add("http://localhost:5175");

        // Allow any frontend deployed on Render
        originPatterns.add("https://*.onrender.com");

        // Support explicit deployed frontend origins from environment variables or properties
        addOrigins(originPatterns, allowedOrigins);
        addOrigins(originPatterns, frontendOrigin);
        addOrigins(originPatterns, frontendUrl);

        config.setAllowedOriginPatterns(new ArrayList<>(originPatterns));
        config.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"));
        config.setAllowedMethods(Arrays.asList("OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"));
        config.setExposedHeaders(Collections.singletonList("Authorization"));
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private void addOrigins(Set<String> targetSet, String rawOrigins) {
        if (rawOrigins == null || rawOrigins.trim().isEmpty()) {
            return;
        }
        for (String origin : rawOrigins.split(",")) {
            String trimmed = origin.trim().replaceAll("/+$", "");
            if (!trimmed.isEmpty()) {
                targetSet.add(trimmed);
            }
        }
    }
}

