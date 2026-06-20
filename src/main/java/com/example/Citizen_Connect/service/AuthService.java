package com.example.Citizen_Connect.service;

import com.example.Citizen_Connect.dto.request.LoginRequest;
import com.example.Citizen_Connect.dto.request.RegisterRequest;
import com.example.Citizen_Connect.dto.response.AuthResponse;
import com.example.Citizen_Connect.exception.EmailAlreadyExistsException;
import com.example.Citizen_Connect.exception.ResourceNotFoundException;
import com.example.Citizen_Connect.model.Role;
import com.example.Citizen_Connect.model.User;
import com.example.Citizen_Connect.model.VerificationToken;
import com.example.Citizen_Connect.repository.UserRepository;
import com.example.Citizen_Connect.repository.VerificationTokenRepository;
import com.example.Citizen_Connect.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("An account already exists with: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getEmail().toLowerCase().startsWith("admin@") ? Role.ADMIN : Role.CITIZEN)
                .emailVerified(true)
                .build();

        User saved = userRepository.save(user);

        String tokenValue = UUID.randomUUID().toString();
        tokenRepository.save(VerificationToken.builder()
                .token(tokenValue)
                .user(saved)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build());

        emailService.sendVerificationEmail(saved.getEmail(), saved.getName(), tokenValue);
        return "Registration successful! Please check your email to verify your account.";
    }

    @Transactional
    public String verifyEmail(String tokenValue) {
        VerificationToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid verification link."));

        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new IllegalStateException("Verification link has expired. Please register again.");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(token);
        return "Email verified successfully! You can now log in.";
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .token(jwtTokenProvider.generateToken(auth))
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
