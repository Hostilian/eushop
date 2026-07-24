package com.eushop.core.repository;

import com.eushop.core.entity.MarketplaceLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplaceLedgerRepository extends JpaRepository<MarketplaceLedgerEntry, String> {

    List<MarketplaceLedgerEntry> findByMarketplaceOrderId(String marketplaceOrderId);

    List<MarketplaceLedgerEntry> findBySellerId(String sellerId);

    Optional<MarketplaceLedgerEntry> findByIdempotencyKey(String idempotencyKey);
}
