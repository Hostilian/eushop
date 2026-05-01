package com.eushop.core.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_food_id", columnList = "food_id"),
    @Index(name = "idx_reviewer_id", columnList = "reviewer_id"),
    @Index(name = "idx_seller_id", columnList = "seller_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "food_id", nullable = false)
    private String foodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", insertable = false, updatable = false)
    private Food food;

    @Column(name = "reviewer_id", nullable = false)
    private String reviewerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", insertable = false, updatable = false)
    private User reviewer;

    @Column(name = "seller_id", nullable = false)
    private String sellerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", insertable = false, updatable = false)
    private User seller;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    @Column(nullable = false)
    private Integer rating;

    @NotBlank(message = "Review comment is required")
    @Column(length = 2000, nullable = false)
    private String comment;

    @Column(columnDefinition = "JSONB")
    private String highlights; // JSON array of positive aspects

    @Column(columnDefinition = "JSONB")
    private String improvements; // JSON array of areas to improve

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean verified; // Only reviewers who purchased can be verified

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        verified = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
