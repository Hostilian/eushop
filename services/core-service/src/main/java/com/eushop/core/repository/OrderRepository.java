package com.eushop.core.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    @EntityGraph(attributePaths = {"food", "seller", "buyer"})
    Page<Order> findByBuyerId(String buyerId, Pageable pageable);

    @EntityGraph(attributePaths = {"food", "seller", "buyer"})
    Page<Order> findBySellerId(String sellerId, Pageable pageable);

    @EntityGraph(attributePaths = {"food", "seller", "buyer"})
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"food", "seller", "buyer"})
    @Query("SELECT o FROM Order o WHERE o.buyerId = :buyerId AND o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByBuyerIdAndStatus(@Param("buyerId") String buyerId, @Param("status") Order.OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"food", "seller", "buyer"})
    @Query("SELECT o FROM Order o WHERE o.sellerId = :sellerId AND o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findBySellerIdAndStatus(@Param("sellerId") String sellerId, @Param("status") Order.OrderStatus status, Pageable pageable);

    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.sellerId = :sellerId AND o.status = 'DELIVERED'")
    Double calculateSellerRevenue(@Param("sellerId") String sellerId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt >= :since")
    Long countCompletedOrdersSince(@Param("since") LocalDateTime since);

    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt >= :since")
    Double calculateTotalRevenuesSince(@Param("since") LocalDateTime since);

    Long countByBuyerId(String buyerId);

    Long countBySellerId(String sellerId);

    /**
     * Used by the Stripe webhook handler to find the order for a given PaymentIntent.
     */
<<<<<<< HEAD
    @EntityGraph(attributePaths = {"food", "seller", "buyer"})
    java.util.Optional<Order> findByStripePaymentIntentId(String stripePaymentIntentId);

    @Query("SELECT o.sellerId AS sellerId, " +
           "SUM(o.totalPrice) AS totalConsideration, " +
           "COUNT(o) AS transactionCount, " +
           "SUM(o.platformFeeEur) AS platformFeeTotal, " +
           "SUM(o.sellerPayoutEur) AS sellerPayoutTotal " +
           "FROM Order o " +
           "WHERE o.status = 'DELIVERED' " +
           "AND o.completedAt >= :startOfYear AND o.completedAt < :endOfYear " +
           "GROUP BY o.sellerId")
    List<Map<String, Object>> calculateDac7AggregatesForYear(
            @Param("startOfYear") LocalDateTime startOfYear,
            @Param("endOfYear") LocalDateTime endOfYear);

    /**
     * GDPR Article 17 — Right to Erasure.
     * Clears PII from orders (message and shipping_address) for a given user.
     * Called when a user exercises their right to be forgotten.
     */
    @Transactional
    @Modifying
    @Query("UPDATE Order o SET o.message = NULL, o.shippingAddress = NULL WHERE o.buyerId = :userId OR o.sellerId = :userId")
    void updateOrderPiiWhereBuyerIdOrSellerId(@Param("userId") String userId);
}
=======
    java.util.Optional<Order> findByStripePaymentIntentId(String stripePaymentIntentId);
}
>>>>>>> pull-1
