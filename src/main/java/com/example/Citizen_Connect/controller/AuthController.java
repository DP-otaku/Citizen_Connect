package com.example.Citizen_Connect.controller;

import com.example.Citizen_Connect.dto.request.LoginRequest;
import com.example.Citizen_Connect.dto.request.RegisterRequest;
import com.example.Citizen_Connect.dto.response.AuthResponse;
import com.example.Citizen_Connect.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(Map.of("message", authService.register(request)));
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, String>> verify(@RequestParam String token) {
        return ResponseEntity.ok(Map.of("message", authService.verifyEmail(token)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
