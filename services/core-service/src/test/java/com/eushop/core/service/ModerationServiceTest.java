package com.eushop.core.service;

import com.eushop.core.entity.Order;
import com.eushop.core.entity.User;
import com.eushop.core.repository.FoodRepository;
import com.eushop.core.repository.OrderRepository;
import com.eushop.core.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ModerationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FoodRepository foodRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ModerationService moderationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testApproveSeller_Success() {
        User user = new User();
        user.setId("user-100");
        user.setRole(User.UserRole.SELLER);
        user.setKycVerified(false);

        when(userRepository.findById("user-100")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User approved = moderationService.approveSeller("user-100", "admin-1");
        assertTrue(approved.getKycVerified());
        assertTrue(approved.getSelfCertifiedCompliant());
    }

    @Test
    void testResolveDispute_Refund() {
        Order order = new Order();
        order.setId("order-99");
        order.setStatus(Order.OrderStatus.DISPUTED);

        when(orderRepository.findById("order-99")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order resolved = moderationService.resolveDispute("order-99", "REFUND", "admin-1");
        assertEquals(Order.OrderStatus.REFUNDED, resolved.getStatus());
    }
}
