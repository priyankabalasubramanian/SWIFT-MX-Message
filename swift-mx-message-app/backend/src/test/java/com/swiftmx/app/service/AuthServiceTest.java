package com.swiftmx.app.service;

import com.swiftmx.app.config.JwtTokenProvider;
import com.swiftmx.app.dto.LoginRequest;
import com.swiftmx.app.dto.LoginResponse;
import com.swiftmx.app.model.User;
import com.swiftmx.app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Test Suite - Email Authentication")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User(
                "operator@swiftmx.bank",
                "OP-84920",
                "$2a$10$encodedPasswordHash",
                "Authorised Operations Specialist",
                "OPERATOR"
        );
    }

    @Test
    @DisplayName("Should successfully authenticate user by valid email and password")
    void testAuthenticateSuccessWithEmail() {
        LoginRequest request = new LoginRequest("operator@swiftmx.bank", "password123");

        when(userRepository.findByEmail("operator@swiftmx.bank")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "$2a$10$encodedPasswordHash")).thenReturn(true);
        when(jwtTokenProvider.generateToken("operator@swiftmx.bank", "OPERATOR")).thenReturn("mock-jwt-token");

        LoginResponse response = authService.authenticate(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("operator@swiftmx.bank", response.getEmail());
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("OPERATOR", response.getRole());
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when email is not found")
    void testAuthenticateFailsWithNonexistentEmail() {
        LoginRequest request = new LoginRequest("unknown@swiftmx.bank", "password123");

        when(userRepository.findByEmail("unknown@swiftmx.bank")).thenReturn(Optional.empty());
        when(userRepository.findByUsername("unknown@swiftmx.bank")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.authenticate(request));
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when password does not match")
    void testAuthenticateFailsWithWrongPassword() {
        LoginRequest request = new LoginRequest("operator@swiftmx.bank", "wrongPassword");

        when(userRepository.findByEmail("operator@swiftmx.bank")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPassword", "$2a$10$encodedPasswordHash")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.authenticate(request));
    }
}
