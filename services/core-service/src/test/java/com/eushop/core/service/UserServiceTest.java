package com.eushop.core.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eushop.core.entity.User;
import com.eushop.core.entity.ConsentLog;
import com.eushop.core.repository.UserRepository;
import com.eushop.core.repository.ConsentLogRepository;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ConsentLogRepository consentLogRepository;

    @InjectMocks
    private UserService userService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId("test-uuid");
        mockUser.setEmail("buyer@eushop.eu");
        mockUser.setName("Jean Dupont");
        mockUser.setCountry("FR");
        mockUser.setAuth0Sub("auth0|12345");
        mockUser.setRole(User.UserRole.BUYER);
    }

    @Test
    void testCreateUser_Success() {
        when(userRepository.findByEmail(mockUser.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        User created = userService.createUser("buyer@eushop.eu", "Jean Dupont", "FR", "auth0|12345");

        assertNotNull(created);
        assertEquals("buyer@eushop.eu", created.getEmail());
        assertEquals("Jean Dupont", created.getName());
        assertEquals("FR", created.getCountry());
        assertEquals(User.UserRole.BUYER, created.getRole());

        verify(userRepository, times(1)).findByEmail("buyer@eushop.eu");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testCreateUser_DuplicateEmailThrowsException() {
        when(userRepository.findByEmail(mockUser.getEmail())).thenReturn(Optional.of(mockUser));

        assertThrows(IllegalArgumentException.class, () -> {
            userService.createUser("buyer@eushop.eu", "Jean Dupont", "FR", "auth0|12345");
        });

        verify(userRepository, times(1)).findByEmail("buyer@eushop.eu");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testGetUserById_Found() {
        when(userRepository.findById("test-uuid")).thenReturn(Optional.of(mockUser));

        Optional<User> found = userService.getUserById("test-uuid");

        assertTrue(found.isPresent());
        assertEquals("test-uuid", found.get().getId());
        verify(userRepository, times(1)).findById("test-uuid");
    }

    @Test
    void testBecomeSeller_Success() {
        when(userRepository.findById("test-uuid")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        com.eushop.core.dto.BecomeSellerRequest request = new com.eushop.core.dto.BecomeSellerRequest();
        request.setTaxId("CZ12345678");
        request.setVatNumber("CZ12345678");
        request.setTradeRegisterNumber("12345678");
        request.setAddressStreet("Václavské náměstí 1");
        request.setAddressCity("Prague");
        request.setAddressPostalCode("11000");
        request.setSelfCertifiedCompliant(true);

        User updatedUser = userService.becomeSeller("test-uuid", request);

        assertNotNull(updatedUser);
        assertEquals(User.UserRole.SELLER, updatedUser.getRole());
        assertEquals("CZ12345678", updatedUser.getTaxId());
        assertEquals("CZ12345678", updatedUser.getVatNumber());
        assertEquals("12345678", updatedUser.getTradeRegisterNumber());
        assertEquals("Václavské náměstí 1", updatedUser.getAddressStreet());
        assertEquals("Prague", updatedUser.getAddressCity());
        assertEquals("11000", updatedUser.getAddressPostalCode());
        assertTrue(updatedUser.getSelfCertifiedCompliant());
        assertFalse(updatedUser.getKycVerified()); // Check it is false initially
        verify(userRepository, times(1)).findById("test-uuid");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testVerifySeller_Success() {
        when(userRepository.findById("test-uuid")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updatedUser = userService.verifySeller("test-uuid", true);

        assertNotNull(updatedUser);
        assertTrue(updatedUser.getKycVerified());
        verify(userRepository, times(1)).findById("test-uuid");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testAnonymiseUser_Success() {
        when(userRepository.findById("test-uuid")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.anonymiseUser("test-uuid");

        assertTrue(mockUser.getEmail().startsWith("deleted_"));
        assertEquals("[Deleted User]", mockUser.getName());
        assertNull(mockUser.getAuth0Sub());
        assertNull(mockUser.getTaxId());
        
        verify(userRepository, times(1)).findById("test-uuid");
        verify(userRepository, times(1)).save(mockUser);
    }

    @Test
    void testExportUserData_Success() {
        when(userRepository.findById("test-uuid")).thenReturn(Optional.of(mockUser));

        java.util.Map<String, Object> data = userService.exportUserData("test-uuid");

        assertNotNull(data);
        assertEquals("test-uuid", data.get("id"));
        assertEquals("buyer@eushop.eu", data.get("email"));
        assertEquals("Jean Dupont", data.get("name"));
        assertEquals("BUYER", data.get("role"));
        
        verify(userRepository, times(1)).findById("test-uuid");
    }

    @Test
    void testRecordConsent_Success() {
        when(consentLogRepository.save(any(ConsentLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ConsentLog logged = userService.recordConsent("test-uuid", "cookie_analytics", "2026-07-04", true, "192.168.1.1", "Mozilla/5.0");

        assertNotNull(logged);
        assertEquals("test-uuid", logged.getUserId());
        assertEquals("cookie_analytics", logged.getConsentType());
        assertEquals("2026-07-04", logged.getConsentVersion());
        assertTrue(logged.getGranted());
        assertNotNull(logged.getIpHash());
        assertEquals(64, logged.getIpHash().length());
        assertNotNull(logged.getUserAgentHash());
        assertEquals(64, logged.getUserAgentHash().length());

        verify(consentLogRepository, times(1)).save(any(ConsentLog.class));
    }
}
