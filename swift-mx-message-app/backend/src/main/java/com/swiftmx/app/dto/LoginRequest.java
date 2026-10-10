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
        this.email = email;
        this.username = email;
        this.password = password;
    }

    public String getEmail() {
        return (email != null && !email.isBlank()) ? email : username;
    }

    public void setEmail(String email) {
        this.email = email;
        if (this.username == null) {
            this.username = email;
        }
    }

    public String getUsername() {
        return (username != null && !username.isBlank()) ? username : email;
    }

    public void setUsername(String username) {
        this.username = username;
        if (this.email == null) {
            this.email = username;
        }
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
