package com.eushop.core.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.Order;
import com.eushop.core.entity.Food;
import com.eushop.core.dto.CreateOrderRequest;
import com.eushop.core.repository.FoodRepository;
import com.eushop.core.repository.OrderRepository;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final FoodRepository foodRepository;

    public OrderService(OrderRepository orderRepository, FoodRepository foodRepository) {
        this.orderRepository = orderRepository;
        this.foodRepository = foodRepository;
    }

    public Order createOrder(CreateOrderRequest request, String buyerId) {
        Food food = foodRepository.findById(request.getFoodId())
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));
        if (!Boolean.TRUE.equals(food.getAvailable()) || food.getQuantity() == null || food.getQuantity() < request.getQuantity()) {
            throw new IllegalStateException("Food is unavailable in the requested quantity");
        }
        if (food.getSellerId().equals(buyerId)) {
            throw new IllegalArgumentException("Buyers cannot order their own listing");
        }
        Order order = new Order();
        order.setBuyerId(buyerId);
        order.setSellerId(food.getSellerId());
        order.setFoodId(food.getId());
        order.setQuantity(request.getQuantity());
        order.setMessage(request.getMessage());
        order.setShippingAddress(request.getShippingAddress());
        order.setFinderFee(food.getFinderFee());
        order.setTotalPrice(roundCurrency(food.getPrice() * request.getQuantity()));
        order.setStatus(Order.OrderStatus.PENDING);
        double fee = roundCurrency(order.getTotalPrice() * 0.15);
        order.setPlatformFeeEur(fee);
        order.setSellerPayoutEur(roundCurrency(order.getTotalPrice() - fee));
        return orderRepository.save(order);
    }

    private double roundCurrency(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    public Page<Order> getBuyerOrders(String buyerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByBuyerId(buyerId, pageable);
    }

    public Page<Order> getSellerOrders(String sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findBySellerId(sellerId, pageable);
    }

    public Page<Order> getOrdersByStatus(Order.OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByStatus(status, pageable);
    }

    public Page<Order> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findAll(pageable);
    }

    public Order updateOrderStatus(String orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(status);
        
        if (status == Order.OrderStatus.DELIVERED) {
            order.setCompletedAt(LocalDateTime.now());
        }
        
        return orderRepository.save(order);
    }

    public Order cancelOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order cannot be cancelled in current status");
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    public Double getSellerRevenue(String sellerId) {
        Double revenue = orderRepository.calculateSellerRevenue(sellerId);
        return revenue != null ? revenue : 0.0;
    }

    /**
     * Looks up an order by its Stripe PaymentIntent ID.
     * Used by the webhook handler to confirm/cancel payment asynchronously.
     */
    public Optional<Order> getOrderByPaymentIntentId(String stripePaymentIntentId) {
        return orderRepository.findByStripePaymentIntentId(stripePaymentIntentId);
    }
}
