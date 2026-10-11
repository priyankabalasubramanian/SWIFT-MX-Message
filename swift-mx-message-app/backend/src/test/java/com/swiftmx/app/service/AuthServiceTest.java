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

    @Mock
    private GoogleTokenVerifierService googleTokenVerifierService;

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
    @DisplayName("Should successfully authenticate existing user with Google token")
    void testAuthenticateWithGoogleExistingUserSuccess() {
        String googleIdToken = "valid-google-token";
        GoogleTokenVerifierService.GoogleUserInfo googleUserInfo =
                new GoogleTokenVerifierService.GoogleUserInfo("operator@swiftmx.bank", "Verified Operator", "sub-12345");

        when(googleTokenVerifierService.verify(googleIdToken)).thenReturn(googleUserInfo);
        when(userRepository.findByEmail("operator@swiftmx.bank")).thenReturn(Optional.of(sampleUser));
        when(jwtTokenProvider.generateToken("operator@swiftmx.bank", "OPERATOR")).thenReturn("mock-jwt-token");

        LoginResponse response = authService.authenticateWithGoogle(googleIdToken);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("operator@swiftmx.bank", response.getEmail());
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("OPERATOR", response.getRole());
    }

    @Test
    @DisplayName("Should successfully create new user and authenticate with Google token")
    void testAuthenticateWithGoogleNewUserSuccess() {
        String googleIdToken = "new-user-google-token";
        GoogleTokenVerifierService.GoogleUserInfo googleUserInfo =
                new GoogleTokenVerifierService.GoogleUserInfo("newtester@gmail.com", "New Tester", "sub-67890");

        when(googleTokenVerifierService.verify(googleIdToken)).thenReturn(googleUserInfo);
        when(userRepository.findByEmail("newtester@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.existsByUsername("newtester@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$generatedHash");

        User savedUser = new User("newtester@gmail.com", "newtester@gmail.com", "$2a$10$generatedHash", "New Tester", "OPERATOR");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateToken("newtester@gmail.com", "OPERATOR")).thenReturn("new-user-jwt-token");

        LoginResponse response = authService.authenticateWithGoogle(googleIdToken);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("newtester@gmail.com", response.getEmail());
        assertEquals("new-user-jwt-token", response.getToken());
        assertEquals("OPERATOR", response.getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when Google token is invalid")
    void testAuthenticateWithGoogleInvalidToken() {
        String invalidToken = "invalid-token";
        when(googleTokenVerifierService.verify(invalidToken))
                .thenThrow(new BadCredentialsException("Invalid or expired Google authentication token"));

        assertThrows(BadCredentialsException.class, () -> authService.authenticateWithGoogle(invalidToken));
    }
}
