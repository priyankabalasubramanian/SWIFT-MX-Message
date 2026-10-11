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

    @Test
    @DisplayName("Should successfully register a new user with hashed password and issue JWT")
    void testRegisterSuccess() {
        com.swiftmx.app.dto.RegisterRequest request =
                new com.swiftmx.app.dto.RegisterRequest("Jane Doe", "jane.doe@swiftmx.bank", "securePassword123");

        when(userRepository.existsByEmail("jane.doe@swiftmx.bank")).thenReturn(false);
        when(passwordEncoder.encode("securePassword123")).thenReturn("$2a$10$hashedSecurePassword");

        User savedUser = new User("jane.doe@swiftmx.bank", "jane.doe@swiftmx.bank", "$2a$10$hashedSecurePassword", "Jane Doe", "OPERATOR");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateToken("jane.doe@swiftmx.bank", "OPERATOR")).thenReturn("jwt-register-token");

        LoginResponse response = authService.register(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("jane.doe@swiftmx.bank", response.getEmail());
        assertEquals("Jane Doe", response.getFullName());
        assertEquals("jwt-register-token", response.getToken());
        assertEquals("OPERATOR", response.getRole());
        verify(passwordEncoder).encode("securePassword123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw DuplicateEmailException when registering an already registered email")
    void testRegisterFailsWithDuplicateEmail() {
        com.swiftmx.app.dto.RegisterRequest request =
                new com.swiftmx.app.dto.RegisterRequest("Existing User", "operator@swiftmx.bank", "password123");

        when(userRepository.existsByEmail("operator@swiftmx.bank")).thenReturn(true);

        assertThrows(com.swiftmx.app.exception.DuplicateEmailException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
