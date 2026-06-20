package com.example.Citizen_Connect.controller;

import com.example.Citizen_Connect.dto.request.ReportRequest;
import com.example.Citizen_Connect.dto.response.ReportResponse;
import com.example.Citizen_Connect.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponse> create(
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reportService.createReport(request, user.getUsername()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReportResponse>> myReports(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(reportService.getMyReports(user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(reportService.getReportById(id, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        reportService.deleteReport(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
