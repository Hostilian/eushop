package com.eushop.core.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "consent_log", indexes = {
    @Index(name = "idx_consent_log_user_id", columnList = "user_id"),
    @Index(name = "idx_consent_log_type", columnList = "consent_type"),
    @Index(name = "idx_consent_log_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id")
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @NotBlank(message = "Consent type is required")
    @Column(name = "consent_type", nullable = false, length = 60)
    private String consentType;

    @NotBlank(message = "Consent version is required")
    @Column(name = "consent_version", nullable = false, length = 20)
    private String consentVersion;

    @NotNull(message = "Granted status is required")
    @Column(nullable = false)
    private Boolean granted;

    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "user_agent_hash", length = 64)
    private String userAgentHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
