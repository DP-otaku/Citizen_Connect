package com.example.Citizen_Connect.dto.response;

import com.example.Citizen_Connect.model.DisasterType;
import com.example.Citizen_Connect.model.ReportStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponse {
    private Long id;
    private String title;
    private String description;
    private DisasterType disasterType;
    private Double latitude;
    private Double longitude;
    private ReportStatus status;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
