package com.eushop.core.repository;

import com.eushop.core.entity.MarketplaceRefund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplaceRefundRepository
        extends JpaRepository<MarketplaceRefund, String> {

    Optional<MarketplaceRefund> findByIdempotencyKey(String idempotencyKey);

    Optional<MarketplaceRefund> findByStripeRefundId(String stripeRefundId);

    List<MarketplaceRefund> findBySellerOrderIdOrderByCreatedAtAsc(
            String sellerOrderId);
}
