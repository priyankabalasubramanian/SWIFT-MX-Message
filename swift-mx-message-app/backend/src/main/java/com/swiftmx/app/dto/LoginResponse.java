package com.swiftmx.app.dto;

public class LoginResponse {

    private boolean success;
    private String token;
    private String tokenType = "Bearer";
    private String email;
    private String username;
    private String fullName;
    private String role;
    private String message;

    public LoginResponse() {}

    public LoginResponse(boolean success, String token, String email, String fullName, String role, String message) {
        this.success = success;
        this.token = token;
        this.email = email;
        this.username = email;
        this.fullName = fullName;
        this.role = role;
        this.message = message;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public String getEmail() { return email != null ? email : username; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username != null ? username : email; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
