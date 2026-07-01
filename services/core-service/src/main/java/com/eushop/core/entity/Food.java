package com.eushop.core.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "foods", indexes = {
    @Index(name = "idx_seller_id", columnList = "seller_id"),
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_country", columnList = "country")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Food name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Description is required")
    @Column(length = 1000, nullable = false)
    private String description;

    @Column(name = "seller_id", nullable = false)
    private String sellerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", insertable = false, updatable = false)
    private User seller;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category; // e.g., "Chocolate", "Cheese", "Wine", "Charcuterie"

    @Column(nullable = false)
    @Min(value = 0, message = "Price must be positive")
    private Double price;

    @Column(nullable = false)
    @Min(value = 0, message = "Finder fee must be positive")
    private Double finderFee; // Commission for platform

    @NotBlank(message = "Country is required")
    @Column(nullable = false)
    private String country;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer quantity; // Stock quantity

    @Column(columnDefinition = "JSONB")
    private String dietaryRestrictions; // JSON array: ["Vegan", "Gluten-Free"]

    @Column(columnDefinition = "JSONB", nullable = false)
    private String allergens; // JSON array of allergens (e.g., ["Nuts", "Gluten"])

    @Column(columnDefinition = "JSONB")
    private String images; // JSON array of image URLs

    @Column(columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean available;

    @Column(columnDefinition = "FLOAT DEFAULT 5.0")
    private Float averageRating;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer reviewCount;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer viewCount;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer salesCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        available = true;
        averageRating = 5.0f;
        reviewCount = 0;
        viewCount = 0;
        salesCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
