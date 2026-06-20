package com.example.Citizen_Connect.dto.response;

import com.example.Citizen_Connect.model.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean emailVerified;
    private LocalDateTime createdAt;
}
