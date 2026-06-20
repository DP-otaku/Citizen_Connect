package com.example.Citizen_Connect.dto.request;

import com.example.Citizen_Connect.model.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateReportStatusRequest {

    @NotNull(message = "Status is required")
    private ReportStatus status;
}
