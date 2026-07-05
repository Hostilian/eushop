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
    @Size(max = 60, message = "Consent type must not exceed 60 characters")
    @Column(name = "consent_type", nullable = false, length = 60)
    private String consentType;

    @NotBlank(message = "Consent version is required")
    @Size(max = 20, message = "Consent version must not exceed 20 characters")
    @Column(name = "consent_version", nullable = false, length = 20)
    private String consentVersion;

    @NotNull(message = "Granted status is required")
    @Column(nullable = false)
    private Boolean granted;

    @Size(max = 64, message = "IP hash must not exceed 64 characters")
    @Pattern(regexp = "^[a-fA-F0-9]{0,64}$", message = "IP hash must be a valid hexadecimal string")
    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Size(max = 64, message = "User agent hash must not exceed 64 characters")
    @Pattern(regexp = "^[a-fA-F0-9]{0,64}$", message = "User agent hash must be a valid hexadecimal string")
    @Column(name = "user_agent_hash", length = 64)
    private String userAgentHash;

    @Size(max = 512, message = "User agent must not exceed 512 characters")
    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Size(max = 45, message = "IP address must not exceed 45 characters")
    @Pattern(regexp = "^([0-9a-fA-F.:]{1,45}|\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})$", 
             message = "IP address must be a valid IPv4 or IPv6 address")
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Size(max = 50, message = "Consent source must not exceed 50 characters")
    @Column(name = "consent_source", length = 50)
    private String consentSource; // e.g., "web_gdpr_page", "mobile_app", "api"

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "audit_notes", length = 1000)
    private String auditNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        
        // Graceful degradation: Set default values for required fields if they're null
        if (consentType == null || consentType.trim().isEmpty()) {
            consentType = "unknown";
        } else {
            // Ensure it doesn't exceed maximum length
            consentType = consentType.length() > 60 ? consentType.substring(0, 60) : consentType;
        }
        
        if (consentVersion == null || consentVersion.trim().isEmpty()) {
            consentVersion = "1.0";
        } else {
            consentVersion = consentVersion.length() > 20 ? consentVersion.substring(0, 20) : consentVersion;
        }
        
        if (granted == null) {
            granted = false;
        }
        
        // Set default consent source if not provided
        if (consentSource == null || consentSource.trim().isEmpty()) {
            consentSource = "web_unknown";
        } else {
            consentSource = consentSource.length() > 50 ? consentSource.substring(0, 50) : consentSource;
        }
        
        // Graceful degradation: Clean up user agent if too long
        if (userAgent != null && userAgent.length() > 512) {
            userAgent = userAgent.substring(0, 512);
        }
        
        // Graceful degradation: Validate IP address format
        if (ipAddress != null && ipAddress.length() > 45) {
            ipAddress = ipAddress.substring(0, 45);
        }
    }
}
