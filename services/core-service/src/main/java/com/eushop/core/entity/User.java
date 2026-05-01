package com.eushop.core.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_auth0_sub", columnList = "auth0_sub"),
    @Index(name = "idx_email", columnList = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Email
    @NotBlank(message = "Email is required")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @Column(name = "auth0_sub", unique = true)
    private String auth0Sub; // Auth0 user ID for JWT verification

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role; // BUYER, SELLER, ADMIN

    @Pattern(regexp = "^[A-Z]{2}$", message = "Country must be 2-letter ISO code")
    @Column(nullable = false)
    private String country;

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean emailVerified;

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean kycVerified; // Know Your Customer verification for sellers

    @Column(length = 500)
    private String profileBio;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(columnDefinition = "FLOAT DEFAULT 5.0")
    private Float averageRating; // 0-5 star rating

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer reviewCount;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer completedOrders;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        emailVerified = false;
        kycVerified = false;
        averageRating = 5.0f;
        reviewCount = 0;
        completedOrders = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum UserRole {
        BUYER, SELLER, ADMIN
    }
}
