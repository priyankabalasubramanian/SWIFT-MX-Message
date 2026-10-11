package com.swiftmx.app.service;

import com.swiftmx.app.config.JwtTokenProvider;
import com.swiftmx.app.dto.LoginRequest;
import com.swiftmx.app.dto.LoginResponse;
import com.swiftmx.app.model.User;
import com.swiftmx.app.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       GoogleTokenVerifierService googleTokenVerifierService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.googleTokenVerifierService = googleTokenVerifierService;
    }

    public LoginResponse authenticate(LoginRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
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

    public LoginResponse authenticateWithGoogle(String idToken) {
        GoogleTokenVerifierService.GoogleUserInfo googleUser = googleTokenVerifierService.verify(idToken);
        String email = googleUser.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            String username = email;
            if (userRepository.existsByUsername(username)) {
                username = email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 6);
            }
            String randomPasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());
            String fullName = (googleUser.name() != null && !googleUser.name().isBlank())
                    ? googleUser.name().trim()
                    : email.split("@")[0];

            User newUser = new User(email, username, randomPasswordHash, fullName, "OPERATOR");
            return userRepository.save(newUser);
        });

        String userEmail = user.getEmail() != null ? user.getEmail() : user.getUsername();
        String token = jwtTokenProvider.generateToken(userEmail, user.getRole());

        return new LoginResponse(
                true,
                token,
                userEmail,
                user.getFullName(),
                user.getRole(),
                "Google authentication successful"
        );
    }
}

