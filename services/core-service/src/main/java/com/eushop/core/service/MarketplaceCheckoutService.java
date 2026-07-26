package com.eushop.core.service;

import com.eushop.core.dto.MarketplaceCheckoutLineRequest;
import com.eushop.core.dto.MarketplaceCheckoutRequest;
import com.eushop.core.dto.MarketplaceCheckoutResponse;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class MarketplaceCheckoutService {

    private static final String CURRENCY = "EUR";
    private static final long SHIPPING_FEE_PER_SELLER_CENTS = 999L;
    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.15");

    private final MarketplaceOrderRepository marketplaceOrderRepository;
    private final SellerOrderRepository sellerOrderRepository;
    private final MarketplaceOrderLineRepository orderLineRepository;
    private final FoodRepository foodRepository;
    private final UserRepository userRepository;
    private final FoodVatRateProvider vatRateProvider;

    public MarketplaceCheckoutService(
            MarketplaceOrderRepository marketplaceOrderRepository,
            SellerOrderRepository sellerOrderRepository,
            MarketplaceOrderLineRepository orderLineRepository,
            FoodRepository foodRepository,
            UserRepository userRepository,
            FoodVatRateProvider vatRateProvider) {
        this.marketplaceOrderRepository = marketplaceOrderRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.orderLineRepository = orderLineRepository;
        this.foodRepository = foodRepository;
        this.userRepository = userRepository;
        this.vatRateProvider = vatRateProvider;
    }

    @Transactional
    public PreparedMarketplaceCheckout prepareCheckout(
            String buyerId,
            String idempotencyKey,
            MarketplaceCheckoutRequest request) {
        requireIdentifier(buyerId, "Buyer ID");
        validateIdempotencyKey(idempotencyKey);

        var existing = marketplaceOrderRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            MarketplaceOrder marketplaceOrder = existing.get();
            if (!Objects.equals(marketplaceOrder.getBuyerId(), buyerId)) {
                throw new SecurityException("Idempotency key belongs to a different buyer");
            }
            return new PreparedMarketplaceCheckout(
                    marketplaceOrder,
                    sellerOrderRepository.findByMarketplaceOrderIdOrderByCreatedAtAsc(
                            marketplaceOrder.getId()));
        }

        String destinationCountry = request.destinationCountryIso2()
                .toUpperCase(Locale.ROOT);
        BigDecimal vatRate = vatRateProvider.requireRate(destinationCountry);
        Map<String, Integer> requestedQuantities = mergeRequestedQuantities(request.items());
        Map<String, Food> foodsById = loadFoods(requestedQuantities.keySet());

        Map<String, List<LineDraft>> linesBySeller = new LinkedHashMap<>();
        for (Map.Entry<String, Integer> entry : requestedQuantities.entrySet()) {
            Food food = foodsById.get(entry.getKey());
            int quantity = entry.getValue();
            validateFoodForCheckout(food, quantity);
            validateTraderForCheckout(food.getSellerId());

            long unitPriceCents = toCents(food.getPrice(), "Food price");
            long lineTotalCents = Math.multiplyExact(unitPriceCents, quantity);
            LineDraft line = new LineDraft(food, quantity, unitPriceCents, lineTotalCents);
            linesBySeller.computeIfAbsent(food.getSellerId(), ignored -> new ArrayList<>())
                    .add(line);
        }

        MarketplaceOrder marketplaceOrder = new MarketplaceOrder();
        marketplaceOrder.setBuyerId(buyerId);
        marketplaceOrder.setCurrency(CURRENCY);
        marketplaceOrder.setIdempotencyKey(idempotencyKey);
        marketplaceOrder.setStatus(MarketplaceOrder.MarketplaceOrderStatus.PAYMENT_PENDING);
        marketplaceOrder.setDestinationCountryIso2(destinationCountry);
        marketplaceOrder.setShippingAddress(request.shippingAddress().trim());

        List<SellerDraft> sellerDrafts = new ArrayList<>();
        long grandSubtotalCents = 0L;
        long grandShippingCents = 0L;
        long grandVatCents = 0L;
        long grandTotalCents = 0L;

        for (Map.Entry<String, List<LineDraft>> sellerEntry : linesBySeller.entrySet()) {
            long subtotalCents = sellerEntry.getValue().stream()
                    .mapToLong(LineDraft::lineTotalCents)
                    .reduce(0L, Math::addExact);
            long vatCents = percentageOf(subtotalCents, vatRate);

            // COMPLIANCE-REVIEW: The current launch wedge uses a deterministic
            // per-seller shipping charge. Tax treatment and carrier-specific
            // pricing require tax/logistics sign-off before live invoicing.
            long shippingFeeCents = SHIPPING_FEE_PER_SELLER_CENTS;
            long totalCents = Math.addExact(
                    Math.addExact(subtotalCents, vatCents),
                    shippingFeeCents);
            long platformFeeCents = percentageOf(subtotalCents, PLATFORM_FEE_RATE);

            // COMPLIANCE-REVIEW: VAT is retained as a separate liability
            // snapshot. Seller payout allocation requires tax/accounting review.
            long sellerPayoutCents = Math.addExact(
                    Math.subtractExact(subtotalCents, platformFeeCents),
                    shippingFeeCents);

            sellerDrafts.add(new SellerDraft(
                    sellerEntry.getKey(),
                    sellerEntry.getValue(),
                    subtotalCents,
                    shippingFeeCents,
                    vatCents,
                    totalCents,
                    platformFeeCents,
                    sellerPayoutCents));

            grandSubtotalCents = Math.addExact(grandSubtotalCents, subtotalCents);
            grandShippingCents = Math.addExact(grandShippingCents, shippingFeeCents);
            grandVatCents = Math.addExact(grandVatCents, vatCents);
            grandTotalCents = Math.addExact(grandTotalCents, totalCents);
        }

        marketplaceOrder.setGrandSubtotalCents(grandSubtotalCents);
        marketplaceOrder.setGrandShippingCents(grandShippingCents);
        marketplaceOrder.setGrandVatCents(grandVatCents);
        marketplaceOrder.setGrandTotalCents(grandTotalCents);
        MarketplaceOrder savedMarketplaceOrder = marketplaceOrderRepository.save(marketplaceOrder);

        List<SellerOrder> savedSellerOrders = new ArrayList<>();
        for (SellerDraft sellerDraft : sellerDrafts) {
            SellerOrder sellerOrder = new SellerOrder();
            sellerOrder.setMarketplaceOrderId(savedMarketplaceOrder.getId());
            sellerOrder.setSellerId(sellerDraft.sellerId());
            sellerOrder.setSubtotalCents(sellerDraft.subtotalCents());
            sellerOrder.setShippingFeeCents(sellerDraft.shippingFeeCents());
            sellerOrder.setVatCents(sellerDraft.vatCents());
            sellerOrder.setTotalCents(sellerDraft.totalCents());
            sellerOrder.setPlatformFeeCents(sellerDraft.platformFeeCents());
            sellerOrder.setSellerPayoutCents(sellerDraft.sellerPayoutCents());
            sellerOrder.setCurrency(CURRENCY);
            sellerOrder.setStatus(SellerOrder.SellerOrderStatus.PENDING);
            SellerOrder savedSellerOrder = sellerOrderRepository.save(sellerOrder);
            savedSellerOrders.add(savedSellerOrder);

            List<MarketplaceOrderLine> lines = sellerDraft.lines().stream()
                    .map(line -> toOrderLine(savedSellerOrder.getId(), line))
                    .toList();
            orderLineRepository.saveAll(lines);
        }

        return new PreparedMarketplaceCheckout(savedMarketplaceOrder, savedSellerOrders);
    }

    @Transactional
    public PreparedMarketplaceCheckout attachPaymentIntent(
            String marketplaceOrderId,
            String paymentIntentId) {
        requireIdentifier(paymentIntentId, "PaymentIntent ID");
        MarketplaceOrder marketplaceOrder = requireMarketplaceOrder(marketplaceOrderId);
        if (marketplaceOrder.getStripePaymentIntentId() != null
                && !marketplaceOrder.getStripePaymentIntentId().equals(paymentIntentId)) {
            throw new IllegalStateException("Marketplace order already has a different PaymentIntent");
        }
        marketplaceOrder.setStripePaymentIntentId(paymentIntentId);
        marketplaceOrder.setStatus(
                MarketplaceOrder.MarketplaceOrderStatus.PAYMENT_REQUIRES_ACTION);
        MarketplaceOrder saved = marketplaceOrderRepository.save(marketplaceOrder);
        return new PreparedMarketplaceCheckout(
                saved,
                sellerOrderRepository.findByMarketplaceOrderIdOrderByCreatedAtAsc(saved.getId()));
    }

    @Transactional
    public boolean markPaymentSucceeded(String paymentIntentId) {
        var marketplaceOrderResult =
                marketplaceOrderRepository.findByStripePaymentIntentId(paymentIntentId);
        if (marketplaceOrderResult.isEmpty()) {
            return false;
        }
        MarketplaceOrder marketplaceOrder = marketplaceOrderResult.get();
        marketplaceOrder.setStatus(MarketplaceOrder.MarketplaceOrderStatus.PAID);
        marketplaceOrderRepository.save(marketplaceOrder);

        List<SellerOrder> sellerOrders =
                sellerOrderRepository.findByMarketplaceOrderIdOrderByCreatedAtAsc(
                        marketplaceOrder.getId());
        sellerOrders.forEach(order -> order.setStatus(SellerOrder.SellerOrderStatus.PAID));
        sellerOrderRepository.saveAll(sellerOrders);
        return true;
    }

    @Transactional
    public boolean markPaymentFailed(String paymentIntentId) {
        var marketplaceOrderResult =
                marketplaceOrderRepository.findByStripePaymentIntentId(paymentIntentId);
        if (marketplaceOrderResult.isEmpty()) {
            return false;
        }
        MarketplaceOrder marketplaceOrder = marketplaceOrderResult.get();
        marketplaceOrder.setStatus(MarketplaceOrder.MarketplaceOrderStatus.PAYMENT_FAILED);
        marketplaceOrderRepository.save(marketplaceOrder);

        List<SellerOrder> sellerOrders =
                sellerOrderRepository.findByMarketplaceOrderIdOrderByCreatedAtAsc(
                        marketplaceOrder.getId());
        sellerOrders.forEach(order -> order.setStatus(SellerOrder.SellerOrderStatus.CANCELLED));
        sellerOrderRepository.saveAll(sellerOrders);
        return true;
    }

    @Transactional
    public void redactShippingAddressForBuyer(String buyerId) {
        marketplaceOrderRepository.redactShippingAddressByBuyerId(buyerId);
    }

    public MarketplaceCheckoutResponse toResponse(
            PreparedMarketplaceCheckout prepared,
            String clientSecret) {
        MarketplaceOrder order = prepared.marketplaceOrder();
        List<MarketplaceCheckoutResponse.SellerOrderSummary> sellerSummaries =
                prepared.sellerOrders().stream()
                        .map(sellerOrder -> new MarketplaceCheckoutResponse.SellerOrderSummary(
                                sellerOrder.getId(),
                                sellerOrder.getSellerId(),
                                sellerOrder.getSubtotalCents(),
                                sellerOrder.getShippingFeeCents(),
                                sellerOrder.getVatCents(),
                                sellerOrder.getTotalCents(),
                                sellerOrder.getPlatformFeeCents(),
                                sellerOrder.getSellerPayoutCents(),
                                sellerOrder.getStatus().name()))
                        .toList();

        return new MarketplaceCheckoutResponse(
                order.getId(),
                order.getStripePaymentIntentId(),
                clientSecret,
                order.getStatus().name(),
                order.getCurrency(),
                valueOrZero(order.getGrandSubtotalCents()),
                valueOrZero(order.getGrandShippingCents()),
                valueOrZero(order.getGrandVatCents()),
                valueOrZero(order.getGrandTotalCents()),
                sellerSummaries);
    }

    private Map<String, Integer> mergeRequestedQuantities(
            List<MarketplaceCheckoutLineRequest> items) {
        Map<String, Integer> quantities = new LinkedHashMap<>();
        for (MarketplaceCheckoutLineRequest item : items) {
            requireIdentifier(item.foodId(), "Food ID");
            int mergedQuantity = Math.addExact(
                    quantities.getOrDefault(item.foodId(), 0),
                    item.quantity());
            if (mergedQuantity > 100) {
                throw new IllegalArgumentException(
                        "Quantity per food cannot exceed 100");
            }
            quantities.put(item.foodId(), mergedQuantity);
        }
        return quantities;
    }

    private Map<String, Food> loadFoods(Iterable<String> foodIds) {
        List<String> ids = new ArrayList<>();
        foodIds.forEach(ids::add);
        Map<String, Food> foodsById = foodRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Food::getId, Function.identity()));
        if (foodsById.size() != ids.size()) {
            throw new IllegalArgumentException("One or more foods are unavailable");
        }
        return foodsById;
    }

    private void validateFoodForCheckout(Food food, int requestedQuantity) {
        if (!Boolean.TRUE.equals(food.getAvailable())) {
            throw new IllegalArgumentException("Food is not available");
        }
        if (food.getQuantity() == null || food.getQuantity() < requestedQuantity) {
            throw new IllegalArgumentException("Requested quantity is not in stock");
        }
        requireIdentifier(food.getSellerId(), "Seller ID");
    }

    private void validateTraderForCheckout(String sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Seller does not exist"));
        boolean hasAddress = hasText(seller.getAddressStreet())
                && hasText(seller.getAddressCity())
                && hasText(seller.getAddressPostalCode());
        boolean isTraceableTrader = seller.getRole() == User.UserRole.SELLER
                && Boolean.TRUE.equals(seller.getKycVerified())
                && Boolean.TRUE.equals(seller.getSelfCertifiedCompliant())
                && hasText(seller.getTradeRegisterNumber())
                && hasAddress;
        if (!isTraceableTrader) {
            // COMPLIANCE-REVIEW: This is the conservative DSA Article 30
            // transaction gate. Legal review must confirm final evidence fields.
            throw new IllegalStateException(
                    "Seller has not completed trader traceability verification");
        }
    }

    private MarketplaceOrderLine toOrderLine(String sellerOrderId, LineDraft line) {
        MarketplaceOrderLine orderLine = new MarketplaceOrderLine();
        orderLine.setSellerOrderId(sellerOrderId);
        orderLine.setOfferId(line.food().getId());
        orderLine.setFoodId(line.food().getId());
        orderLine.setProductName(line.food().getName());
        orderLine.setQuantity(line.quantity());
        orderLine.setUnitPriceCents(line.unitPriceCents());
        orderLine.setTotalCents(line.lineTotalCents());
        orderLine.setCurrency(CURRENCY);
        return orderLine;
    }

    private MarketplaceOrder requireMarketplaceOrder(String marketplaceOrderId) {
        requireIdentifier(marketplaceOrderId, "Marketplace order ID");
        return marketplaceOrderRepository.findById(marketplaceOrderId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Marketplace order not found"));
    }

    private static long percentageOf(long amountCents, BigDecimal rate) {
        return BigDecimal.valueOf(amountCents)
                .multiply(rate)
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    private static long toCents(Double amount, String fieldName) {
        if (amount == null || !Double.isFinite(amount) || amount < 0) {
            throw new IllegalArgumentException(fieldName + " must be non-negative");
        }
        return BigDecimal.valueOf(amount)
                .movePointRight(2)
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    private static void validateIdempotencyKey(String idempotencyKey) {
        requireIdentifier(idempotencyKey, "Idempotency key");
        if (idempotencyKey.length() > 128) {
            throw new IllegalArgumentException("Idempotency key is too long");
        }
    }

    private static void requireIdentifier(String value, String fieldName) {
        if (!hasText(value)) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static long valueOrZero(Long value) {
        return value == null ? 0L : value;
    }

    public record PreparedMarketplaceCheckout(
            MarketplaceOrder marketplaceOrder,
            List<SellerOrder> sellerOrders) {
    }

    private record LineDraft(
            Food food,
            int quantity,
            long unitPriceCents,
            long lineTotalCents) {
    }

    private record SellerDraft(
            String sellerId,
            List<LineDraft> lines,
            long subtotalCents,
            long shippingFeeCents,
            long vatCents,
            long totalCents,
            long platformFeeCents,
            long sellerPayoutCents) {
    }
}
