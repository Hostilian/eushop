package com.eushop.core.repository;

import com.eushop.core.entity.MarketplaceOrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceOrderLineRepository
        extends JpaRepository<MarketplaceOrderLine, String> {

    List<MarketplaceOrderLine> findBySellerOrderIdOrderByIdAsc(String sellerOrderId);
}
