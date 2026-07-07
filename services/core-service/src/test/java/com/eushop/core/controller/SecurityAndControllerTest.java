package com.eushop.core.controller;

import com.eushop.core.config.JwtAuthenticationFilter;
import com.eushop.core.config.SecurityConfig;
import com.eushop.core.service.FoodService;
import com.eushop.core.service.OrderService;
import com.eushop.core.service.PaymentService;
import com.eushop.core.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
public class SecurityAndControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FoodService foodService;

    @MockBean
    private UserService userService;

    @MockBean
    private OrderService orderService;

    @MockBean
    private PaymentService paymentService;

    @MockBean
    private JdbcTemplate jdbcTemplate;

    @Test
    public void testPublicEndpoint_Foods_Success() throws Exception {
        mockMvc.perform(get("/api/foods"))
                .andExpect(status().isOk());
    }

    @Test
    public void testSecureEndpoint_Orders_BlockedUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testCorsPreflight() throws Exception {
        mockMvc.perform(options("/api/foods")
                .header("Origin", "http://localhost:3002")
                .header("Access-Control-Request-Method", "GET")
                .header("Access-Control-Request-Headers", "Authorization, Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3002"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    public void testStripeWebhook_MockSecret_Success() throws Exception {
        String mockPayload = "{\"id\":\"evt_test_123\",\"type\":\"payment_intent.succeeded\",\"data\":{\"object\":{\"id\":\"pi_test_123\",\"amount\":5000}}}";
        
        when(jdbcTemplate.update(anyString(), any(Object.class))).thenReturn(1);

        mockMvc.perform(post("/api/webhooks/stripe")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mockPayload)
                .header("Stripe-Signature", "t=123,v1=abc"))
                .andExpect(status().isOk())
                .andExpect(content().string("Received"));
    }
}
