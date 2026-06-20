package com.example.Citizen_Connect.repository;

import com.example.Citizen_Connect.model.DisasterReport;
import com.example.Citizen_Connect.model.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisasterReportRepository extends JpaRepository<DisasterReport, Long> {
    List<DisasterReport> findByUserId(Long userId);
    List<DisasterReport> findByStatus(ReportStatus status);
    List<DisasterReport> findAllByOrderByCreatedAtDesc();
}
