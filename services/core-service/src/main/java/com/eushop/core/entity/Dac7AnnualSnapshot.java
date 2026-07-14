package com.eushop.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "dac7_annual_snapshot", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"seller_id", "reporting_year"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dac7AnnualSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "seller_id", nullable = false)
    private String sellerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", insertable = false, updatable = false)
    private User seller;

    @Column(name = "reporting_year", nullable = false)
    private Short reportingYear;

    @Column(name = "total_consideration", nullable = false)
    private Double totalConsideration;

    @Column(name = "transaction_count", nullable = false)
    private Integer transactionCount;

    @Column(name = "platform_fee_total", nullable = false)
    private Double platformFeeTotal;

    @Column(name = "seller_payout_total", nullable = false)
    private Double sellerPayoutTotal;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
