package com.swiftmx.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swiftmx.app.dto.LoginRequest;
import com.swiftmx.app.dto.RegisterRequest;
import com.swiftmx.app.model.User;
import com.swiftmx.app.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("AuthController Full Integration Test Suite - Registration, Login, Persistence")
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        userRepository.findByEmailIgnoreCase("alex.rivera@swiftmx.bank")
                .ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("Should register new user, reject duplicates with 409, authenticate, and verify persistence")
    void testFullRegistrationLoginPersistenceFlow() throws Exception {
        String email = "alex.rivera@swiftmx.bank";
        String password = "SecurePassword2026!";
        String fullName = "Alex Rivera";

        // 1. Initial Registration
        RegisterRequest regReq = new RegisterRequest(fullName, email, password);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.email").value(email.toLowerCase()))
                .andExpect(jsonPath("$.fullName").value(fullName));

        // 2. Verify Database Persistence & Password Hashing
        Optional<User> persistedUser = userRepository.findByEmailIgnoreCase(email);
        assertTrue(persistedUser.isPresent(), "User must be persisted in database");
        assertNotEquals(password, persistedUser.get().getPasswordHash(), "Password must not be stored in plain text");
        assertTrue(passwordEncoder.matches(password, persistedUser.get().getPasswordHash()), "BCrypt hash must match original password");
        assertEquals(email.toLowerCase(), persistedUser.get().getEmail());

        // 3. Duplicate Registration with Exact Email -> Must return HTTP 409 Conflict
        RegisterRequest exactDuplicate = new RegisterRequest("Alex Duplicate", email, "anotherPassword123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exactDuplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("An account with this email address already exists. Please sign in instead."));

        // 4. Duplicate Registration with Mixed-Case & Whitespace Padded Email -> Must return HTTP 409 Conflict
        RegisterRequest mixedCaseDuplicate = new RegisterRequest("Alex Case Test", "  ALEX.RIVERA@SWIFTMX.BANK  ", "password999");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mixedCaseDuplicate)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("An account with this email address already exists. Please sign in instead."));

        // 5. Successful Login using Original Credentials
        LoginRequest loginReq = new LoginRequest(email, password);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.email").value(email.toLowerCase()));

        // 6. Successful Login using Mixed-Case and Whitespace Email
        LoginRequest mixedCaseLogin = new LoginRequest("  ALEX.RIVERA@SWIFTMX.BANK  ", password);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mixedCaseLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.email").value(email.toLowerCase()));

        // 7. Login with Wrong Password -> Must return HTTP 401 Unauthorized
        LoginRequest wrongPassLogin = new LoginRequest(email, "WrongPassword!");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPassLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email address or password"));

        // 8. Login with Nonexistent Email -> Must return HTTP 401 Unauthorized
        LoginRequest nonexistentLogin = new LoginRequest("ghost@swiftmx.bank", password);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nonexistentLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email address or password"));
    }

    @Test
    @DisplayName("Should verify user record persists in database and is authenticateable in subsequent sessions")
    void testUserPersistenceAndLoginAfterSession() throws Exception {
        String email = "persistent.operator@swiftmx.bank";
        String password = "PersistPassword2026$";

        // Clean up beforehand if exists
        userRepository.findByEmailIgnoreCase(email).ifPresent(userRepository::delete);

        // Register
        RegisterRequest regReq = new RegisterRequest("Persistent Operator", email, password);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString());

        // Verify direct repository query returns the stored user
        Optional<User> loadedUser = userRepository.findByEmailIgnoreCase(email);
        assertTrue(loadedUser.isPresent(), "User entity must persist in database");
        assertEquals(email.toLowerCase(), loadedUser.get().getEmail());
        assertTrue(passwordEncoder.matches(password, loadedUser.get().getPasswordHash()));

        // Subsequent login simulating later session
        LoginRequest loginReq = new LoginRequest(email, password);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.email").value(email.toLowerCase()))
                .andExpect(jsonPath("$.token").isString());

        // Clean up
        userRepository.findByEmailIgnoreCase(email).ifPresent(userRepository::delete);
    }
}
