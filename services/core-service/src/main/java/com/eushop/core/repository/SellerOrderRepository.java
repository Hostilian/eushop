package com.eushop.core.repository;

import com.eushop.core.entity.SellerOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerOrderRepository extends JpaRepository<SellerOrder, String> {

    List<SellerOrder> findByMarketplaceOrderIdOrderByCreatedAtAsc(String marketplaceOrderId);

    List<SellerOrder> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM SellerOrder o WHERE o.id = :id")
    Optional<SellerOrder> findByIdForUpdate(@Param("id") String id);
}
