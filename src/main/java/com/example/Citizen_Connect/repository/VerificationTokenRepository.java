package com.example.Citizen_Connect.repository;

import com.example.Citizen_Connect.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);

    @Transactional
    void deleteByUserId(Long userId);
}
