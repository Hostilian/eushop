package com.eushop.core.service;

import com.eushop.core.dto.MarketplaceRefundRequest;
import com.eushop.core.entity.MarketplaceOrder;
import com.eushop.core.entity.MarketplaceRefund;
import com.eushop.core.entity.SellerOrder;
import com.eushop.core.entity.User;
import com.eushop.core.repository.MarketplaceOrderRepository;
import com.eushop.core.repository.MarketplaceRefundRepository;
import com.eushop.core.repository.SellerOrderRepository;
import com.eushop.core.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MarketplaceRefundServiceTest {

    @Mock
    private MarketplaceRefundRepository refundRepository;
    @Mock
    private SellerOrderRepository sellerOrderRepository;
    @Mock
    private MarketplaceOrderRepository marketplaceOrderRepository;
    @Mock
    private UserRepository userRepository;

    private MarketplaceRefundService refundService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        refundService = new MarketplaceRefundService(
                refundRepository,
                sellerOrderRepository,
                marketplaceOrderRepository,
                userRepository);
        when(refundRepository.findByIdempotencyKey(any()))
                .thenReturn(Optional.empty());
        when(refundRepository.save(any(MarketplaceRefund.class)))
                .thenAnswer(invocation -> {
                    MarketplaceRefund refund = invocation.getArgument(0);
                    if (refund.getId() == null) {
                        refund.setId("refund-1");
                    }
                    return refund;
                });
        when(sellerOrderRepository.save(any(SellerOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(marketplaceOrderRepository.save(any(MarketplaceOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void owningSellerCanReserveOnlyTheRemainingRefundableAmount() {
        MarketplaceOrder marketplaceOrder = paidMarketplaceOrder();
        SellerOrder sellerOrder = paidSellerOrder();
        User seller = user("seller-1", User.UserRole.SELLER);
        MarketplaceRefund submitted = refund(
                "refund-existing",
                200L,
                MarketplaceRefund.MarketplaceRefundStatus.SUBMITTED);

        when(sellerOrderRepository.findByIdForUpdate("seller-order-1"))
                .thenReturn(Optional.of(sellerOrder));
        when(userRepository.findById("seller-1")).thenReturn(Optional.of(seller));
        when(marketplaceOrderRepository.findById("marketplace-1"))
                .thenReturn(Optional.of(marketplaceOrder));
        when(refundRepository.findBySellerOrderIdOrderByCreatedAtAsc(
                "seller-order-1")).thenReturn(List.of(submitted));

        var prepared = refundService.prepareRefund(
                "seller-1",
                "refund-key-1",
                "seller-order-1",
                new MarketplaceRefundRequest(700L, "Customer request"));

        assertEquals(700L, prepared.refund().getAmountCents());
        assertEquals(
                MarketplaceRefund.MarketplaceRefundStatus.REQUESTED,
                prepared.refund().getStatus());

        assertThrows(IllegalArgumentException.class, () ->
                refundService.prepareRefund(
                        "seller-1",
                        "refund-key-2",
                        "seller-order-1",
                        new MarketplaceRefundRequest(701L, "Too much")));
    }

    @Test
    void unrelatedSellerCannotRequestRefund() {
        when(sellerOrderRepository.findByIdForUpdate("seller-order-1"))
                .thenReturn(Optional.of(paidSellerOrder()));
        when(userRepository.findById("seller-other"))
                .thenReturn(Optional.of(user(
                        "seller-other",
                        User.UserRole.SELLER)));

        assertThrows(SecurityException.class, () ->
                refundService.prepareRefund(
                        "seller-other",
                        "refund-key-1",
                        "seller-order-1",
                        new MarketplaceRefundRequest(100L, "Not my order")));
    }

    @Test
    void signedProviderSuccessAppliesRefundExactlyOnce() {
        MarketplaceOrder marketplaceOrder = paidMarketplaceOrder();
        SellerOrder sellerOrder = paidSellerOrder();
        MarketplaceRefund refund = refund(
                "refund-1",
                400L,
                MarketplaceRefund.MarketplaceRefundStatus.SUBMITTED);
        refund.setStripeRefundId("re_1");

        when(refundRepository.findByStripeRefundId("re_1"))
                .thenReturn(Optional.of(refund));
        when(marketplaceOrderRepository.findById("marketplace-1"))
                .thenReturn(Optional.of(marketplaceOrder));
        when(sellerOrderRepository.findByIdForUpdate("seller-order-1"))
                .thenReturn(Optional.of(sellerOrder));
        when(sellerOrderRepository.findByMarketplaceOrderIdOrderByCreatedAtAsc(
                "marketplace-1")).thenReturn(List.of(sellerOrder));

        refundService.applyProviderRefund(
                "re_1",
                "pi_marketplace",
                400L,
                "succeeded",
                null);
        refundService.applyProviderRefund(
                "re_1",
                "pi_marketplace",
                400L,
                "succeeded",
                null);

        assertEquals(400L, sellerOrder.getRefundedAmountCents());
        assertEquals(
                SellerOrder.SellerOrderStatus.PARTIALLY_REFUNDED,
                sellerOrder.getStatus());
        assertEquals(
                MarketplaceOrder.MarketplaceOrderStatus.PARTIALLY_REFUNDED,
                marketplaceOrder.getStatus());
        assertEquals(
                MarketplaceRefund.MarketplaceRefundStatus.SUCCEEDED,
                refund.getStatus());
        verify(sellerOrderRepository, times(1))
                .findByIdForUpdate("seller-order-1");
    }

    @Test
    void rejectsProviderAmountMismatchBeforeApplying() {
        MarketplaceRefund refund = refund(
                "refund-1",
                400L,
                MarketplaceRefund.MarketplaceRefundStatus.SUBMITTED);
        refund.setStripeRefundId("re_1");
        when(refundRepository.findByStripeRefundId("re_1"))
                .thenReturn(Optional.of(refund));
        when(marketplaceOrderRepository.findById("marketplace-1"))
                .thenReturn(Optional.of(paidMarketplaceOrder()));

        assertThrows(IllegalStateException.class, () ->
                refundService.applyProviderRefund(
                        "re_1",
                        "pi_marketplace",
                        401L,
                        "succeeded",
                        null));
    }

    private static MarketplaceOrder paidMarketplaceOrder() {
        MarketplaceOrder order = new MarketplaceOrder();
        order.setId("marketplace-1");
        order.setStripePaymentIntentId("pi_marketplace");
        order.setStatus(MarketplaceOrder.MarketplaceOrderStatus.PAID);
        order.setGrandTotalCents(1_000L);
        return order;
    }

    private static SellerOrder paidSellerOrder() {
        SellerOrder order = new SellerOrder();
        order.setId("seller-order-1");
        order.setMarketplaceOrderId("marketplace-1");
        order.setSellerId("seller-1");
        order.setTotalCents(1_000L);
        order.setRefundedAmountCents(100L);
        order.setStatus(SellerOrder.SellerOrderStatus.PAID);
        return order;
    }

    private static MarketplaceRefund refund(
            String id,
            long amountCents,
            MarketplaceRefund.MarketplaceRefundStatus status) {
        MarketplaceRefund refund = new MarketplaceRefund();
        refund.setId(id);
        refund.setMarketplaceOrderId("marketplace-1");
        refund.setSellerOrderId("seller-order-1");
        refund.setActorId("seller-1");
        refund.setAmountCents(amountCents);
        refund.setCurrency("EUR");
        refund.setStatus(status);
        return refund;
    }

    private static User user(String id, User.UserRole role) {
        User user = new User();
        user.setId(id);
        user.setRole(role);
        return user;
    }
}
