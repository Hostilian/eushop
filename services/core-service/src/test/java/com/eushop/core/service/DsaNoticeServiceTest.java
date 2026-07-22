package com.eushop.core.service;

import com.eushop.core.entity.User;
import com.eushop.core.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class DsaNoticeServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DsaNoticeService dsaNoticeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testVerifyTraderTraceability_Verified() {
        User seller = new User();
        seller.setId("seller-1");
        seller.setKycVerified(true);
        seller.setSelfCertifiedCompliant(true);

        when(userRepository.findById("seller-1")).thenReturn(Optional.of(seller));

        assertTrue(dsaNoticeService.verifyTraderTraceability("seller-1"));
    }

    @Test
    void testSubmitNoticeAndAction() {
        Map<String, Object> notice = dsaNoticeService.submitNoticeAndAction("user@example.com", "food-123", "Misleading label", "Missing allergen information");
        assertNotNull(notice.get("id"));
        assertEquals("SUBMITTED", notice.get("status"));
    }
}
