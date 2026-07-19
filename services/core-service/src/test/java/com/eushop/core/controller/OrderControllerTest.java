package com.eushop.core.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.entity.Order;
import com.eushop.core.service.OrderService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    private Order order;

    @BeforeEach
    void setUp() {
        order = new Order();
        order.setId("order-1");
        order.setBuyerId("buyer-1");
        order.setSellerId("seller-1");
        order.setFoodId("food-1");
        order.setQuantity(1);
        order.setTotalPrice(100.0);
        order.setFinderFee(5.0);
        order.setVatRate(0.07);
        order.setVatAmount(7.0);
    }

    @Test
    void getOrderById_SerializesVatAuditFields() {
        when(orderService.getOrderById("order-1")).thenReturn(Optional.of(order));

        ResponseEntity<ApiResponse<Order>> response = orderController.getOrderById("order-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        JsonNode orderJson = new ObjectMapper().valueToTree(response.getBody().getData());
        assertTrue(orderJson.has("vatRate"));
        assertTrue(orderJson.has("vatAmount"));
        assertEquals(0.07, orderJson.get("vatRate").asDouble());
        assertEquals(7.0, orderJson.get("vatAmount").asDouble());
    }

    @Test
    void createOrder_PreservesCheckoutVatAuditFields() {
        when(orderService.createOrder(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<ApiResponse<Order>> response = orderController.createOrder(order, "authenticated-buyer");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderService).createOrder(orderCaptor.capture());
        assertEquals("authenticated-buyer", orderCaptor.getValue().getBuyerId());
        assertEquals(0.07, orderCaptor.getValue().getVatRate());
        assertEquals(7.0, orderCaptor.getValue().getVatAmount());
    }
}
