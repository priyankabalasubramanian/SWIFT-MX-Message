package com.swiftmx.app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(name = "uk_users_email", columnNames = {"email"})
}, indexes = {
    @Index(name = "idx_users_email", columnList = "email"),
    @Index(name = "idx_users_username", columnList = "username")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 100)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 30)
    private String role = "OPERATOR";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public User() {}

    public User(String email, String passwordHash, String fullName, String role) {
        this.email = normalizeEmail(email);
        this.username = this.email;
        this.passwordHash = passwordHash;
        this.fullName = fullName != null ? fullName.trim() : "";
        this.role = role;
    }

    public User(String email, String username, String passwordHash, String fullName, String role) {
        this.email = normalizeEmail(email);
        this.username = username != null ? username.trim() : this.email;
        this.passwordHash = passwordHash;
        this.fullName = fullName != null ? fullName.trim() : "";
        this.role = role;
    }

    private static String normalizeEmail(String rawEmail) {
        return rawEmail != null ? rawEmail.trim().toLowerCase(Locale.ROOT) : null;
    }

    @PrePersist
    protected void onCreate() {
        this.email = normalizeEmail(this.email);
        if (this.username != null) {
            this.username = this.username.trim();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.email = normalizeEmail(this.email);
        if (this.username != null) {
            this.username = this.username.trim();
        }
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = normalizeEmail(email); }

    public String getUsername() { return username != null ? username : email; }
    public void setUsername(String username) { this.username = username != null ? username.trim() : null; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName != null ? fullName.trim() : null; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
