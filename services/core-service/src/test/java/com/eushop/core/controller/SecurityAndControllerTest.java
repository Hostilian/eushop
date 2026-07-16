package com.eushop.core.controller;

import com.eushop.core.config.JwtAuthenticationFilter;
import com.eushop.core.config.SecurityConfig;
import com.eushop.core.service.FoodService;
import com.eushop.core.service.OrderService;
import com.eushop.core.service.PaymentService;
import com.eushop.core.service.UserService;
import com.eushop.core.service.Dac7Service;
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

@WebMvcTest(controllers = {FoodController.class, OrderController.class, WebhookController.class, PaymentController.class, Dac7Controller.class, AuthController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
public class SecurityAndControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WebhookController webhookController;

    @MockBean
    private FoodService foodService;

    @MockBean
    private UserService userService;

    @MockBean
    private OrderService orderService;

    @MockBean
    private PaymentService paymentService;

    @MockBean
    private Dac7Service dac7Service;

    @MockBean
    private JdbcTemplate jdbcTemplate;

    @Test
    public void testPublicEndpoint_Foods_Success() throws Exception {
        org.springframework.data.domain.Page<com.eushop.core.entity.Food> emptyPage = new org.springframework.data.domain.PageImpl<>(
                java.util.Collections.emptyList(),
                org.springframework.data.domain.PageRequest.of(0, 10),
                0
        );
        when(foodService.advancedSearch(any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(emptyPage);

        mockMvc.perform(get("/api/foods"))
                .andExpect(status().isOk());
    }

    @Test
    public void testFoodsRejectInvalidPaginationWithActionableError() throws Exception {
        mockMvc.perform(get("/api/foods").param("size", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("size")));
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

    @Test
    public void testStripeWebhook_InvalidSignature_ReturnsBadRequest() throws Exception {
        // Force the controller to use a "real" secret to trigger signature verification
        org.springframework.test.util.ReflectionTestUtils.setField(webhookController, "webhookSecret", "whsec_real_secret_123");
        
        try {
            String mockPayload = "{\"id\":\"evt_test_123\",\"type\":\"payment_intent.succeeded\"}";
            
            mockMvc.perform(post("/api/webhooks/stripe")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mockPayload)
                    .header("Stripe-Signature", "t=123,v1=invalid_sig"))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Invalid signature"));
        } finally {
            // Restore default placeholder secret
            org.springframework.test.util.ReflectionTestUtils.setField(webhookController, "webhookSecret", "whsec_placeholder");
        }
    }

    @Test
    public void testDac7Report_BlockedNonAdmin() throws Exception {
        // {"sub":"buyer-id","email":"buyer@eushop.eu","role":"BUYER"} in Base64
        String buyerToken = "eyJzdWIiOiJidXllci1pZCIsImVtYWlsIjoiYnV5ZXJAZXVzaG9wLmV1Iiwicm9sZSI6IkJVRVIifQ==";
        mockMvc.perform(get("/api/admin/dac7/report?year=2026")
                .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testDac7Report_AllowedAdmin() throws Exception {
        when(dac7Service.generateSnapshotsForYear(2026))
                .thenReturn(java.util.Collections.emptyList());

        // {"sub":"admin-id","email":"admin@eushop.eu","role":"ADMIN"} in Base64
        String adminToken = "eyJzdWIiOiJhZG1pbi1pZCIsImVtYWlsIjoiYWRtaW5AZXVzaG9wLmV1Iiwicm9sZSI6IkFETUlOIn0=";
        mockMvc.perform(get("/api/admin/dac7/report?year=2026")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    public void testAuthLogin_Success() throws Exception {
        com.eushop.core.entity.User mockUser = new com.eushop.core.entity.User();
        mockUser.setId("usr-123");
        mockUser.setEmail("test@eushop.eu");
        mockUser.setName("TEST");
        mockUser.setRole(com.eushop.core.entity.User.UserRole.BUYER);
        mockUser.setKycVerified(false);
        mockUser.setSelfCertifiedCompliant(false);

        when(userService.getUserByEmail("test@eushop.eu")).thenReturn(java.util.Optional.of(mockUser));
        when(userService.updateLastLogin(anyString())).thenReturn(mockUser);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@eushop.eu\",\"password\":\"password\"}"))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("token"))
                .andExpect(cookie().httpOnly("token", true))
                .andExpect(jsonPath("$.user.id").value("usr-123"));
    }

    @Test
    public void testAuthSignup_Success() throws Exception {
        com.eushop.core.entity.User mockUser = new com.eushop.core.entity.User();
        mockUser.setId("usr-123");
        mockUser.setEmail("test@eushop.eu");
        mockUser.setName("TEST");
        mockUser.setRole(com.eushop.core.entity.User.UserRole.BUYER);
        mockUser.setKycVerified(false);
        mockUser.setSelfCertifiedCompliant(false);

        when(userService.getUserByEmail("test@eushop.eu")).thenReturn(java.util.Optional.empty());
        when(userService.createUser(eq("test@eushop.eu"), eq("TEST"), eq("DE"), anyString())).thenReturn(mockUser);

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@eushop.eu\",\"name\":\"TEST\",\"country\":\"DE\"}"))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("token"))
                .andExpect(cookie().httpOnly("token", true));
    }

    @Test
    public void testAuthLogout_Success() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("token", 0));
    }

    @Test
    public void testAuthMe_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testAuthMe_Authenticated() throws Exception {
        com.eushop.core.entity.User mockUser = new com.eushop.core.entity.User();
        mockUser.setId("usr-123");
        mockUser.setEmail("test@eushop.eu");
        mockUser.setName("TEST");
        mockUser.setRole(com.eushop.core.entity.User.UserRole.BUYER);

        when(userService.getUserById("usr-123")).thenReturn(java.util.Optional.of(mockUser));

        // {"sub":"usr-123","email":"test@eushop.eu","role":"BUYER"} in Base64
        String token = "eyJzdWIiOiJ1c3ItMTIzIiwiZW1haWwiOiJ0ZXN0QGV1c2hvcC5ldSIsInJvbGUiOiJCVVlFUiJ9";

        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("usr-123"));
    }
}
