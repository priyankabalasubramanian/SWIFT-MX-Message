package com.swiftmx.app.service;

import com.swiftmx.app.config.JwtTokenProvider;
import com.swiftmx.app.dto.LoginRequest;
import com.swiftmx.app.dto.LoginResponse;
import com.swiftmx.app.dto.RegisterRequest;
import com.swiftmx.app.exception.DuplicateEmailException;
import com.swiftmx.app.model.User;
import com.swiftmx.app.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse authenticate(LoginRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim().toLowerCase(java.util.Locale.ROOT) : "";
        User user = userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByUsernameIgnoreCase(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid email address or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email address or password");
        }

        String userEmail = user.getEmail() != null ? user.getEmail() : user.getUsername();
        String token = jwtTokenProvider.generateToken(userEmail, user.getRole());

        return new LoginResponse(
                true,
                token,
                userEmail,
                user.getFullName(),
                user.getRole(),
                "Authentication successful"
        );
    }

    public LoginResponse register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase(java.util.Locale.ROOT) : "";

        if (email.isBlank()) {
            throw new IllegalArgumentException("Email address is required");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException("An account with this email address already exists. Please sign in instead.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        String fullName = request.getFullName() != null ? request.getFullName().trim() : "";
        String username = email;

        User newUser = new User(email, username, hashedPassword, fullName, "OPERATOR");
        User savedUser;
        try {
            savedUser = userRepository.save(newUser);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new DuplicateEmailException("An account with this email address already exists. Please sign in instead.");
        }

        String userEmail = savedUser.getEmail() != null ? savedUser.getEmail() : savedUser.getUsername();
        String token = jwtTokenProvider.generateToken(userEmail, savedUser.getRole());

        return new LoginResponse(
                true,
                token,
                userEmail,
                savedUser.getFullName(),
                savedUser.getRole(),
                "Account created successfully"
        );
    }
}


