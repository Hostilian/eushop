package com.eushop.core.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.Order;
import com.eushop.core.repository.OrderRepository;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order createOrder(Order order) {
        order.setStatus(Order.OrderStatus.PENDING);
        if (order.getTotalPrice() != null) {
            double fee = Math.round(order.getTotalPrice() * 0.15 * 100.0) / 100.0;
            order.setPlatformFeeEur(fee);
            order.setSellerPayoutEur(Math.round((order.getTotalPrice() - fee) * 100.0) / 100.0);
        }
        return orderRepository.save(order);
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

    public Order disputeOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        if (order.getStatus() == Order.OrderStatus.CANCELLED || order.getStatus() == Order.OrderStatus.REFUNDED) {
            throw new IllegalStateException("Order cannot be disputed in current status");
        }
        
        order.setStatus(Order.OrderStatus.DISPUTED);
        return orderRepository.save(order);
    }

    public Order refundOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        if (order.getStatus() == Order.OrderStatus.CANCELLED || order.getStatus() == Order.OrderStatus.REFUNDED) {
            throw new IllegalStateException("Order cannot be refunded in current status");
        }
        
        order.setStatus(Order.OrderStatus.REFUNDED);
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
