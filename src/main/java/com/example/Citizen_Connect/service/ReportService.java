package com.example.Citizen_Connect.service;

import com.example.Citizen_Connect.dto.request.ReportRequest;
import com.example.Citizen_Connect.dto.request.UpdateReportStatusRequest;
import com.example.Citizen_Connect.dto.response.ReportResponse;
import com.example.Citizen_Connect.exception.ResourceNotFoundException;
import com.example.Citizen_Connect.exception.UnauthorizedException;
import com.example.Citizen_Connect.model.DisasterReport;
import com.example.Citizen_Connect.model.Role;
import com.example.Citizen_Connect.model.User;
import com.example.Citizen_Connect.repository.DisasterReportRepository;
import com.example.Citizen_Connect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final DisasterReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReportResponse createReport(ReportRequest request, String email) {
        User user = findUser(email);
        return toResponse(reportRepository.save(DisasterReport.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .disasterType(request.getDisasterType())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .user(user)
                .build()));
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getMyReports(String email) {
        return reportRepository.findByUserId(findUser(email).getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReportResponse getReportById(Long id, String email) {
        DisasterReport report = findReport(id);
        User user = findUser(email);
        if (user.getRole() == Role.CITIZEN && !report.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorised to view this report.");
        }
        return toResponse(report);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ReportResponse updateStatus(Long id, UpdateReportStatusRequest req) {
        DisasterReport report = findReport(id);
        report.setStatus(req.getStatus());
        return toResponse(reportRepository.save(report));
    }

    @Transactional
    public void deleteReport(Long id, String email) {
        DisasterReport report = findReport(id);
        User user = findUser(email);
        if (user.getRole() == Role.CITIZEN && !report.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorised to delete this report.");
        }
        reportRepository.delete(report);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private DisasterReport findReport(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + id));
    }

    private ReportResponse toResponse(DisasterReport r) {
        return ReportResponse.builder()
                .id(r.getId()).title(r.getTitle()).description(r.getDescription())
                .disasterType(r.getDisasterType()).latitude(r.getLatitude()).longitude(r.getLongitude())
                .status(r.getStatus()).userId(r.getUser().getId()).userName(r.getUser().getName())
                .createdAt(r.getCreatedAt()).updatedAt(r.getUpdatedAt()).build();
    }
}
