package com.example.Citizen_Connect.service;

import com.example.Citizen_Connect.dto.response.UserResponse;
import com.example.Citizen_Connect.exception.ResourceNotFoundException;
import com.example.Citizen_Connect.model.Role;
import com.example.Citizen_Connect.model.User;
import com.example.Citizen_Connect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public UserResponse updateRole(Long id, Role role) {
        User user = find(id);
        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.delete(find(id));
    }

    private User find(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId()).name(u.getName()).email(u.getEmail())
                .role(u.getRole()).emailVerified(u.isEmailVerified()).createdAt(u.getCreatedAt())
                .build();
    }
}
