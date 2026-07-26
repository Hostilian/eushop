package com.eushop.core.repository;

import com.eushop.core.entity.SellerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellerOrderRepository extends JpaRepository<SellerOrder, String> {

    List<SellerOrder> findByMarketplaceOrderIdOrderByCreatedAtAsc(String marketplaceOrderId);

    List<SellerOrder> findBySellerIdOrderByCreatedAtDesc(String sellerId);
}
