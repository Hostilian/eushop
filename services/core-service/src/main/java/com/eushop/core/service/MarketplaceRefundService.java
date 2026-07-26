package com.eushop.core.service;

import com.eushop.core.dto.MarketplaceRefundRequest;
import com.eushop.core.dto.MarketplaceRefundResponse;
import com.eushop.core.entity.MarketplaceOrder;
import com.eushop.core.entity.MarketplaceRefund;
import com.eushop.core.entity.SellerOrder;
import com.eushop.core.entity.User;
import com.eushop.core.repository.MarketplaceOrderRepository;
import com.eushop.core.repository.MarketplaceRefundRepository;
import com.eushop.core.repository.SellerOrderRepository;
import com.eushop.core.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class MarketplaceRefundService {

    private static final String CURRENCY = "EUR";

    private final MarketplaceRefundRepository refundRepository;
    private final SellerOrderRepository sellerOrderRepository;
    private final MarketplaceOrderRepository marketplaceOrderRepository;
    private final UserRepository userRepository;

    public MarketplaceRefundService(
            MarketplaceRefundRepository refundRepository,
            SellerOrderRepository sellerOrderRepository,
            MarketplaceOrderRepository marketplaceOrderRepository,
            UserRepository userRepository) {
        this.refundRepository = refundRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.marketplaceOrderRepository = marketplaceOrderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PreparedMarketplaceRefund prepareRefund(
            String actorId,
            String idempotencyKey,
            String sellerOrderId,
            MarketplaceRefundRequest request) {
        requireIdentifier(actorId, "Actor ID");
        requireIdentifier(sellerOrderId, "Seller order ID");
        validateIdempotencyKey(idempotencyKey);
        if (request.amountCents() <= 0) {
            throw new IllegalArgumentException("Refund amount must be positive");
        }

        var existing = refundRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            MarketplaceRefund refund = existing.get();
            if (!Objects.equals(refund.getActorId(), actorId)
                    || !Objects.equals(refund.getSellerOrderId(), sellerOrderId)) {
                throw new SecurityException(
                        "Idempotency key belongs to a different refund request");
            }
            if (refund.getAmountCents() != request.amountCents()) {
                throw new IllegalStateException(
                        "Idempotency key was already used for a different amount");
            }
            return new PreparedMarketplaceRefund(
                    refund,
                    requireMarketplaceOrder(refund.getMarketplaceOrderId()));
        }

        SellerOrder sellerOrder = sellerOrderRepository.findByIdForUpdate(sellerOrderId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Seller order not found"));
        authorizeRefund(actorId, sellerOrder);
        MarketplaceOrder marketplaceOrder =
                requireMarketplaceOrder(sellerOrder.getMarketplaceOrderId());
        validateRefundableState(marketplaceOrder, sellerOrder);

        long reservedAmountCents = refundRepository
                .findBySellerOrderIdOrderByCreatedAtAsc(sellerOrderId)
                .stream()
                .filter(this::reservesAmount)
                .mapToLong(MarketplaceRefund::getAmountCents)
                .reduce(0L, Math::addExact);
        long availableAmountCents = Math.subtractExact(
                Math.subtractExact(
                        sellerOrder.getTotalCents(),
                        sellerOrder.getRefundedAmountCents()),
                reservedAmountCents);
        if (request.amountCents() > availableAmountCents) {
            throw new IllegalArgumentException(
                    "Refund exceeds the seller order's remaining refundable amount");
        }

        MarketplaceRefund refund = new MarketplaceRefund();
        refund.setMarketplaceOrderId(marketplaceOrder.getId());
        refund.setSellerOrderId(sellerOrder.getId());
        refund.setActorId(actorId);
        refund.setAmountCents(request.amountCents());
        refund.setCurrency(CURRENCY);
        refund.setReason(request.reason().trim());
        refund.setIdempotencyKey(idempotencyKey);
        refund.setStatus(MarketplaceRefund.MarketplaceRefundStatus.REQUESTED);
        MarketplaceRefund saved = refundRepository.save(refund);
        return new PreparedMarketplaceRefund(saved, marketplaceOrder);
    }

    @Transactional
    public MarketplaceRefund attachProviderRefund(
            String refundId,
            MarketplaceRefundResult providerResult) {
        MarketplaceRefund refund = requireRefund(refundId);
        if (refund.getStripeRefundId() != null
                && !refund.getStripeRefundId().equals(providerResult.id())) {
            throw new IllegalStateException(
                    "Refund request already has a different provider refund");
        }
        refund.setStripeRefundId(providerResult.id());
        refund.setStatus(MarketplaceRefund.MarketplaceRefundStatus.SUBMITTED);
        return refundRepository.save(refund);
    }

    @Transactional
    public boolean applyProviderRefund(
            String stripeRefundId,
            String paymentIntentId,
            long amountCents,
            String providerStatus,
            String failureReason) {
        var refundResult = refundRepository.findByStripeRefundId(stripeRefundId);
        if (refundResult.isEmpty()) {
            return false;
        }
        MarketplaceRefund refund = refundResult.get();
        MarketplaceOrder marketplaceOrder =
                requireMarketplaceOrder(refund.getMarketplaceOrderId());
        if (!Objects.equals(
                marketplaceOrder.getStripePaymentIntentId(),
                paymentIntentId)) {
            throw new IllegalStateException(
                    "Provider refund PaymentIntent does not match marketplace order");
        }
        if (refund.getAmountCents() != amountCents) {
            throw new IllegalStateException(
                    "Provider refund amount does not match reserved amount");
        }

        String normalizedStatus = providerStatus == null
                ? ""
                : providerStatus.toLowerCase(Locale.ROOT);
        if ("succeeded".equals(normalizedStatus)) {
            applySucceededRefund(refund, marketplaceOrder);
        } else if ("failed".equals(normalizedStatus)
                || "canceled".equals(normalizedStatus)) {
            refund.setStatus(MarketplaceRefund.MarketplaceRefundStatus.FAILED);
            refund.setFailureReason(limitFailureReason(failureReason));
            refundRepository.save(refund);
        } else {
            refund.setStatus(MarketplaceRefund.MarketplaceRefundStatus.SUBMITTED);
            refundRepository.save(refund);
        }
        return true;
    }

    public MarketplaceRefundResponse toResponse(MarketplaceRefund refund) {
        return new MarketplaceRefundResponse(
                refund.getId(),
                refund.getMarketplaceOrderId(),
                refund.getSellerOrderId(),
                refund.getAmountCents(),
                refund.getCurrency(),
                refund.getStatus().name(),
                refund.getStripeRefundId());
    }

    private void applySucceededRefund(
            MarketplaceRefund refund,
            MarketplaceOrder marketplaceOrder) {
        if (refund.getStatus()
                == MarketplaceRefund.MarketplaceRefundStatus.SUCCEEDED) {
            return;
        }
        SellerOrder sellerOrder = sellerOrderRepository
                .findByIdForUpdate(refund.getSellerOrderId())
                .orElseThrow(() -> new IllegalStateException(
                        "Refund seller order no longer exists"));
        long refundedAmountCents = Math.addExact(
                sellerOrder.getRefundedAmountCents(),
                refund.getAmountCents());
        if (refundedAmountCents > sellerOrder.getTotalCents()) {
            throw new IllegalStateException(
                    "Applied refunds exceed seller order total");
        }
        // COMPLIANCE-REVIEW: This stores the gross refund allocation. VAT
        // correction documents, platform fee adjustments, and any seller
        // settlement reversal require tax/accounting/legal sign-off.
        sellerOrder.setRefundedAmountCents(refundedAmountCents);
        sellerOrder.setStatus(refundedAmountCents == sellerOrder.getTotalCents()
                ? SellerOrder.SellerOrderStatus.REFUNDED
                : SellerOrder.SellerOrderStatus.PARTIALLY_REFUNDED);
        sellerOrderRepository.save(sellerOrder);

        refund.setStatus(MarketplaceRefund.MarketplaceRefundStatus.SUCCEEDED);
        refund.setFailureReason(null);
        refundRepository.save(refund);
        refreshMarketplaceRefundStatus(marketplaceOrder);
    }

    private void refreshMarketplaceRefundStatus(MarketplaceOrder marketplaceOrder) {
        List<SellerOrder> sellerOrders =
                sellerOrderRepository.findByMarketplaceOrderIdOrderByCreatedAtAsc(
                        marketplaceOrder.getId());
        boolean allRefunded = !sellerOrders.isEmpty()
                && sellerOrders.stream().allMatch(
                        order -> order.getRefundedAmountCents() == order.getTotalCents());
        boolean anyRefunded = sellerOrders.stream().anyMatch(
                order -> order.getRefundedAmountCents() > 0);
        if (allRefunded) {
            marketplaceOrder.setStatus(
                    MarketplaceOrder.MarketplaceOrderStatus.REFUNDED);
        } else if (anyRefunded) {
            marketplaceOrder.setStatus(
                    MarketplaceOrder.MarketplaceOrderStatus.PARTIALLY_REFUNDED);
        }
        marketplaceOrderRepository.save(marketplaceOrder);
    }

    private void authorizeRefund(String actorId, SellerOrder sellerOrder) {
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new SecurityException("Refund actor not found"));
        boolean isAdmin = actor.getRole() == User.UserRole.ADMIN;
        boolean isOwningSeller = actor.getRole() == User.UserRole.SELLER
                && Objects.equals(actorId, sellerOrder.getSellerId());
        if (!isAdmin && !isOwningSeller) {
            throw new SecurityException(
                    "Only the owning seller or an administrator may request a refund");
        }
    }

    private static void validateRefundableState(
            MarketplaceOrder marketplaceOrder,
            SellerOrder sellerOrder) {
        boolean marketplacePaid =
                marketplaceOrder.getStatus() == MarketplaceOrder.MarketplaceOrderStatus.PAID
                        || marketplaceOrder.getStatus()
                        == MarketplaceOrder.MarketplaceOrderStatus.PARTIALLY_REFUNDED;
        boolean sellerRefundable = switch (sellerOrder.getStatus()) {
            case PAID, PROCESSING, SHIPPED, DELIVERED, PARTIALLY_REFUNDED -> true;
            default -> false;
        };
        if (!marketplacePaid || !sellerRefundable) {
            throw new IllegalStateException(
                    "Seller order is not in a refundable paid state");
        }
    }

    private boolean reservesAmount(MarketplaceRefund refund) {
        return refund.getStatus() == MarketplaceRefund.MarketplaceRefundStatus.REQUESTED
                || refund.getStatus()
                == MarketplaceRefund.MarketplaceRefundStatus.SUBMITTED;
    }

    private MarketplaceOrder requireMarketplaceOrder(String marketplaceOrderId) {
        return marketplaceOrderRepository.findById(marketplaceOrderId)
                .orElseThrow(() -> new IllegalStateException(
                        "Marketplace order not found"));
    }

    private MarketplaceRefund requireRefund(String refundId) {
        requireIdentifier(refundId, "Refund ID");
        return refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Refund request not found"));
    }

    private static String limitFailureReason(String failureReason) {
        if (failureReason == null) {
            return null;
        }
        return failureReason.length() <= 500
                ? failureReason
                : failureReason.substring(0, 500);
    }

    private static void validateIdempotencyKey(String idempotencyKey) {
        requireIdentifier(idempotencyKey, "Idempotency key");
        if (idempotencyKey.length() > 128) {
            throw new IllegalArgumentException("Idempotency key is too long");
        }
    }

    private static void requireIdentifier(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    public record PreparedMarketplaceRefund(
            MarketplaceRefund refund,
            MarketplaceOrder marketplaceOrder) {
    }
}
