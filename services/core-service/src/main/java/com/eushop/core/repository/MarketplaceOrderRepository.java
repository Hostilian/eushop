package com.eushop.core.repository;

import com.eushop.core.entity.MarketplaceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface MarketplaceOrderRepository extends JpaRepository<MarketplaceOrder, String> {

    Optional<MarketplaceOrder> findByIdempotencyKey(String idempotencyKey);

    Optional<MarketplaceOrder> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<MarketplaceOrder> findByBuyerIdOrderByCreatedAtDesc(String buyerId);

    /**
     * GDPR Article 17: redact marketplace-order delivery PII while retaining
     * legally reviewable financial records.
     */
    @Modifying
    @Query("UPDATE MarketplaceOrder o SET o.shippingAddress = NULL WHERE o.buyerId = :buyerId")
    void redactShippingAddressByBuyerId(@Param("buyerId") String buyerId);
}
