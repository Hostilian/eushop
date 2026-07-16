package com.eushop.core.service;

import com.eushop.core.entity.Order;
import com.eushop.core.entity.Food;
import com.eushop.core.dto.CreateOrderRequest;
import com.eushop.core.repository.FoodRepository;
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
    @Mock
    private FoodRepository foodRepository;

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
        Food food = availableFood();
        CreateOrderRequest request = orderRequest();
        when(foodRepository.findById("food_1")).thenReturn(Optional.of(food));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order created = orderService.createOrder(request, "buyer_1");

        assertEquals(Order.OrderStatus.PENDING, created.getStatus());
        assertEquals(15.0, created.getPlatformFeeEur());
        assertEquals(85.0, created.getSellerPayoutEur());
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    void createOrder_UnavailableFood_FailsWithoutPersisting() {
        Food food = availableFood();
        food.setQuantity(0);
        when(foodRepository.findById("food_1")).thenReturn(Optional.of(food));

        assertThrows(IllegalStateException.class, () -> orderService.createOrder(orderRequest(), "buyer_1"));
        verify(orderRepository, never()).save(any(Order.class));
    }

    private Food availableFood() {
        Food food = new Food();
        food.setId("food_1");
        food.setSellerId("seller_1");
        food.setAvailable(true);
        food.setQuantity(10);
        food.setPrice(50.0);
        food.setFinderFee(7.5);
        return food;
    }

    private CreateOrderRequest orderRequest() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setFoodId("food_1");
        request.setQuantity(2);
        return request;
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
}
