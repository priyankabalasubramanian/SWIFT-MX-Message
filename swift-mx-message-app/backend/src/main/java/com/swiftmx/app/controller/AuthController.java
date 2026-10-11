package com.swiftmx.app.controller;

import com.swiftmx.app.dto.ApiResponse;
import com.swiftmx.app.dto.GoogleLoginRequest;
import com.swiftmx.app.dto.LoginRequest;
import com.swiftmx.app.dto.LoginResponse;
import com.swiftmx.app.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        LoginResponse response = authService.authenticateWithGoogle(request.getIdToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Operator session logged out successfully", null));
    }
}
