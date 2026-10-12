package com.swiftmx.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Email address is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    // Optional legacy field support
    private String username;

    public LoginRequest() {}

    public LoginRequest(String email, String password) {
        String normalized = email != null ? email.trim().toLowerCase(java.util.Locale.ROOT) : null;
        this.email = normalized;
        this.username = normalized;
        this.password = password;
    }

    public String getEmail() {
        String raw = (email != null && !email.isBlank()) ? email : username;
        return raw != null ? raw.trim().toLowerCase(java.util.Locale.ROOT) : null;
    }

    public void setEmail(String email) {
        String normalized = email != null ? email.trim().toLowerCase(java.util.Locale.ROOT) : null;
        this.email = normalized;
        if (this.username == null) {
            this.username = normalized;
        }
    }

    public String getUsername() {
        String raw = (username != null && !username.isBlank()) ? username : email;
        return raw != null ? raw.trim().toLowerCase(java.util.Locale.ROOT) : null;
    }

    public void setUsername(String username) {
        String normalized = username != null ? username.trim().toLowerCase(java.util.Locale.ROOT) : null;
        this.username = normalized;
        if (this.email == null) {
            this.email = normalized;
        }
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
