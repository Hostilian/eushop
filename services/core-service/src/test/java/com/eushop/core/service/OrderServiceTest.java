package com.eushop.core.service;

import com.eushop.core.entity.Order;
import com.eushop.core.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testOrder = new Order();
        testOrder.setId("order_1");
        testOrder.setBuyerId("buyer_1");
        testOrder.setSellerId("seller_1");
        testOrder.setTotalPrice(100.0);
        testOrder.setStatus(Order.OrderStatus.PENDING);
    }

    @Test
    void createOrder_SetsInitialStatusAndFees() {
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order created = orderService.createOrder(testOrder);

        assertEquals(Order.OrderStatus.PENDING, created.getStatus());
        assertEquals(15.0, created.getPlatformFeeEur());
        assertEquals(85.0, created.getSellerPayoutEur());
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    void updateOrderStatus_ValidTransition_SetsStatus() {
        when(orderRepository.findById("order_1")).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order updated = orderService.updateOrderStatus("order_1", Order.OrderStatus.CONFIRMED);

        assertEquals(Order.OrderStatus.CONFIRMED, updated.getStatus());
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    void updateOrderStatus_Delivered_SetsCompletedAt() {
        when(orderRepository.findById("order_1")).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order updated = orderService.updateOrderStatus("order_1", Order.OrderStatus.DELIVERED);

        assertEquals(Order.OrderStatus.DELIVERED, updated.getStatus());
        assertNotNull(updated.getCompletedAt());
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    void cancelOrder_PendingOrder_SetsCancelled() {
        when(orderRepository.findById("order_1")).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order cancelled = orderService.cancelOrder("order_1");

        assertEquals(Order.OrderStatus.CANCELLED, cancelled.getStatus());
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    void cancelOrder_ConfirmedOrder_SetsCancelled() {
        testOrder.setStatus(Order.OrderStatus.CONFIRMED);
        when(orderRepository.findById("order_1")).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order cancelled = orderService.cancelOrder("order_1");

        assertEquals(Order.OrderStatus.CANCELLED, cancelled.getStatus());
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    void cancelOrder_DeliveredOrder_ThrowsException() {
        testOrder.setStatus(Order.OrderStatus.DELIVERED);
        when(orderRepository.findById("order_1")).thenReturn(Optional.of(testOrder));

        assertThrows(IllegalStateException.class, () -> {
            orderService.cancelOrder("order_1");
        });
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void disputeOrder_ValidOrder_SetsDisputed() {
        when(orderRepository.findById("order_1")).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order disputed = orderService.disputeOrder("order_1");

        assertEquals(Order.OrderStatus.DISPUTED, disputed.getStatus());
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    void refundOrder_ValidOrder_SetsRefunded() {
        when(orderRepository.findById("order_1")).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order refunded = orderService.refundOrder("order_1");

        assertEquals(Order.OrderStatus.REFUNDED, refunded.getStatus());
        verify(orderRepository, times(1)).save(testOrder);
    }
}