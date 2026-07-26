package com.eushop.core.service;

import com.eushop.core.dto.MarketplaceCheckoutLineRequest;
import com.eushop.core.dto.MarketplaceCheckoutRequest;
import com.eushop.core.entity.Food;
import com.eushop.core.entity.MarketplaceOrder;
import com.eushop.core.entity.MarketplaceOrderLine;
import com.eushop.core.entity.SellerOrder;
import com.eushop.core.entity.User;
import com.eushop.core.repository.FoodRepository;
import com.eushop.core.repository.MarketplaceOrderLineRepository;
import com.eushop.core.repository.MarketplaceOrderRepository;
import com.eushop.core.repository.SellerOrderRepository;
import com.eushop.core.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MarketplaceCheckoutServiceTest {

    @Mock
    private MarketplaceOrderRepository marketplaceOrderRepository;
    @Mock
    private SellerOrderRepository sellerOrderRepository;
    @Mock
    private MarketplaceOrderLineRepository orderLineRepository;
    @Mock
    private FoodRepository foodRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private FoodVatRateProvider vatRateProvider;

    private MarketplaceCheckoutService checkoutService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        checkoutService = new MarketplaceCheckoutService(
                marketplaceOrderRepository,
                sellerOrderRepository,
                orderLineRepository,
                foodRepository,
                userRepository,
                vatRateProvider);

        when(marketplaceOrderRepository.findByIdempotencyKey(any()))
                .thenReturn(Optional.empty());
        when(vatRateProvider.requireRate("DE")).thenReturn(new BigDecimal("0.07"));
        when(marketplaceOrderRepository.save(any(MarketplaceOrder.class)))
                .thenAnswer(invocation -> {
                    MarketplaceOrder order = invocation.getArgument(0);
                    if (order.getId() == null) {
                        order.setId("marketplace-1");
                    }
                    return order;
                });

        AtomicInteger sellerSequence = new AtomicInteger();
        when(sellerOrderRepository.save(any(SellerOrder.class)))
                .thenAnswer(invocation -> {
                    SellerOrder order = invocation.getArgument(0);
                    if (order.getId() == null) {
                        order.setId("seller-order-" + sellerSequence.incrementAndGet());
                    }
                    return order;
                });
        when(orderLineRepository.saveAll(anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void preparesServerCalculatedTotalsSplitBySeller() {
        Food cheese = food("food-1", "seller-1", "Cheese", 10.00, 10);
        Food oil = food("food-2", "seller-2", "Oil", 20.00, 10);
        when(foodRepository.findAllById(List.of("food-1", "food-2")))
                .thenReturn(List.of(cheese, oil));
        when(userRepository.findById("seller-1"))
                .thenReturn(Optional.of(traceableSeller("seller-1")));
        when(userRepository.findById("seller-2"))
                .thenReturn(Optional.of(traceableSeller("seller-2")));

        MarketplaceCheckoutRequest request = new MarketplaceCheckoutRequest(
                List.of(
                        new MarketplaceCheckoutLineRequest("food-1", 2),
                        new MarketplaceCheckoutLineRequest("food-2", 1)),
                "de",
                "Main Street 1, 10115 Berlin, DE");

        var prepared = checkoutService.prepareCheckout(
                "buyer-1",
                "checkout-key-1",
                request);

        MarketplaceOrder order = prepared.marketplaceOrder();
        assertEquals(4_000L, order.getGrandSubtotalCents());
        assertEquals(1_998L, order.getGrandShippingCents());
        assertEquals(280L, order.getGrandVatCents());
        assertEquals(6_278L, order.getGrandTotalCents());
        assertEquals(2, prepared.sellerOrders().size());

        SellerOrder firstSeller = prepared.sellerOrders().get(0);
        assertEquals(2_000L, firstSeller.getSubtotalCents());
        assertEquals(140L, firstSeller.getVatCents());
        assertEquals(300L, firstSeller.getPlatformFeeCents());
        assertEquals(2_699L, firstSeller.getSellerPayoutCents());
        verify(orderLineRepository, times(2)).saveAll(anyList());
    }

    @Test
    void returnsExistingAggregateForSameBuyerAndIdempotencyKey() {
        MarketplaceOrder existing = new MarketplaceOrder();
        existing.setId("marketplace-existing");
        existing.setBuyerId("buyer-1");
        existing.setIdempotencyKey("checkout-key-1");
        existing.setGrandTotalCents(1_000L);
        SellerOrder sellerOrder = new SellerOrder();
        sellerOrder.setId("seller-order-existing");
        sellerOrder.setMarketplaceOrderId(existing.getId());
        when(marketplaceOrderRepository.findByIdempotencyKey("checkout-key-1"))
                .thenReturn(Optional.of(existing));
        when(sellerOrderRepository.findByMarketplaceOrderIdOrderByCreatedAtAsc(
                existing.getId())).thenReturn(List.of(sellerOrder));

        var prepared = checkoutService.prepareCheckout(
                "buyer-1",
                "checkout-key-1",
                minimalRequest());

        assertEquals(existing, prepared.marketplaceOrder());
        verify(foodRepository, never()).findAllById(anyList());
    }

    @Test
    void rejectsIdempotencyKeyReuseAcrossBuyers() {
        MarketplaceOrder existing = new MarketplaceOrder();
        existing.setBuyerId("buyer-other");
        when(marketplaceOrderRepository.findByIdempotencyKey("checkout-key-1"))
                .thenReturn(Optional.of(existing));

        assertThrows(SecurityException.class, () -> checkoutService.prepareCheckout(
                "buyer-1",
                "checkout-key-1",
                minimalRequest()));
    }

    @Test
    void failsClosedWhenSellerTraceabilityIsIncomplete() {
        Food food = food("food-1", "seller-1", "Cheese", 10.00, 10);
        User incompleteSeller = traceableSeller("seller-1");
        incompleteSeller.setTradeRegisterNumber(null);
        when(foodRepository.findAllById(List.of("food-1"))).thenReturn(List.of(food));
        when(userRepository.findById("seller-1"))
                .thenReturn(Optional.of(incompleteSeller));

        assertThrows(IllegalStateException.class, () -> checkoutService.prepareCheckout(
                "buyer-1",
                "checkout-key-1",
                minimalRequest()));
        verify(marketplaceOrderRepository, never()).save(any());
    }

    private static MarketplaceCheckoutRequest minimalRequest() {
        return new MarketplaceCheckoutRequest(
                List.of(new MarketplaceCheckoutLineRequest("food-1", 1)),
                "DE",
                "Main Street 1, 10115 Berlin, DE");
    }

    private static Food food(
            String id,
            String sellerId,
            String name,
            double price,
            int quantity) {
        Food food = new Food();
        food.setId(id);
        food.setSellerId(sellerId);
        food.setName(name);
        food.setPrice(price);
        food.setQuantity(quantity);
        food.setAvailable(true);
        return food;
    }

    private static User traceableSeller(String id) {
        User seller = new User();
        seller.setId(id);
        seller.setRole(User.UserRole.SELLER);
        seller.setKycVerified(true);
        seller.setSelfCertifiedCompliant(true);
        seller.setTradeRegisterNumber("REG-123");
        seller.setAddressStreet("Seller Street 2");
        seller.setAddressCity("Prague");
        seller.setAddressPostalCode("11000");
        return seller;
    }
}
