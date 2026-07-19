package com.eushop.core.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.User;
import com.eushop.core.entity.ConsentLog;
import com.eushop.core.repository.UserRepository;
import com.eushop.core.repository.ConsentLogRepository;
import com.eushop.core.repository.OrderRepository;
import com.eushop.core.repository.ReviewRepository;
import com.eushop.core.repository.ConversationRepository;
import com.eushop.core.repository.MessageRepository;

/**
 * UserService handles user-related business logic including GDPR compliance
 * operations for data erasure (Article 17) and data portability (Article 20).
 */
@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final ConsentLogRepository consentLogRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public UserService(UserRepository userRepository,
                       ConsentLogRepository consentLogRepository,
                       OrderRepository orderRepository,
                       ReviewRepository reviewRepository,
                       ConversationRepository conversationRepository,
                       MessageRepository messageRepository) {
        this.userRepository = userRepository;
        this.consentLogRepository = consentLogRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    public User createUser(String email, String name, String country, String auth0Sub) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setCountry(country);
        user.setAuth0Sub(auth0Sub);
        user.setRole(User.UserRole.BUYER);
        user.setEmailVerified(false);
        user.setKycVerified(false);

        return userRepository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserByAuth0Sub(String auth0Sub) {
        return userRepository.findByAuth0Sub(auth0Sub);
    }

    public User updateLastLogin(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User updateProfile(String userId, String name, String profileBio, String country) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setName(name);
        user.setProfileBio(profileBio);
        user.setCountry(country);
        return userRepository.save(user);
    }

    public List<User> getTopSellers() {
        return userRepository.findTopSellers();
    }

    public List<User> getSellersByCountry(String country) {
        return userRepository.findSellersByCountry(country);
    }

    public User becomeSeller(String userId, com.eushop.core.dto.BecomeSellerRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(User.UserRole.SELLER);
        user.setTaxId(request.getTaxId());
        user.setVatNumber(request.getVatNumber());
        user.setTradeRegisterNumber(request.getTradeRegisterNumber());
        user.setAddressStreet(request.getAddressStreet());
        user.setAddressCity(request.getAddressCity());
        user.setAddressPostalCode(request.getAddressPostalCode());
        user.setSelfCertifiedCompliant(request.getSelfCertifiedCompliant());
        user.setKycVerified(false); // Admin must verify seller KYC
        return userRepository.save(user);
    }

    public User verifySeller(String userId, boolean verified) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setKycVerified(verified);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRoleOrderByCreatedAtDesc(role);
    }

    // ─── GDPR Compliance ─────────────────────────────────────────────────────

    /**
     * GDPR Article 17 — Right to Erasure ("right to be forgotten").
     *
     * <p>We anonymise rather than hard-delete because order records reference
     * user IDs for DAC7 tax reporting obligations, which override the erasure
     * right where a legal basis for retention exists (GDPR Art. 17(3)(b)).
     *
     * <p>After anonymisation the user can no longer log in (email is wiped),
     * but historical order/transaction data is preserved for the legally-required
     * minimum retention period.
     * <p>
     * This method also anonymizes/PII-clears related data in orders, reviews,
     * conversations, and messages to ensure comprehensive GDPR compliance.
     */
    @Transactional
    public void anonymiseUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String anon = "deleted_" + userId.substring(0, 8);
        user.setEmail(anon + "@deleted.invalid");
        user.setName("[Deleted User]");
        user.setProfileBio(null);
        user.setProfileImageUrl(null);
        user.setAuth0Sub(null);
        user.setTaxId(null);
        user.setVatNumber(null);
        user.setTradeRegisterNumber(null);
        user.setAddressStreet(null);
        user.setAddressCity(null);
        user.setAddressPostalCode(null);
        // Preserve: id, role, country (needed for DAC7), kycVerified, aggregate stats
        userRepository.save(user);

        // Anonymize/PII-clear related data

        // Clear PII in orders: message and shipping_address
        orderRepository.updateOrderPiiWhereBuyerIdOrSellerId(userId);

        // Clear PII in reviews: comment, highlights, improvements
        reviewRepository.updateReviewPiiWhereReviewerIdOrSellerId(userId);

        // Clear PII in conversations: subject, last_message, group_name, group_description
        // Clear PII in messages: content, attachments
        conversationRepository.updateConversationPiiWhereBuyerIdOrSellerId(userId);
        messageRepository.updateMessagePiiWhereSenderId(userId);
    }

    /**
     * GDPR Article 20 — Right to Data Portability.
     * Returns a structured map of all personal data held about the user.
     * The caller (controller) serialises this to JSON for download.
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> exportUserData(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        java.util.Map<String, Object> data = new java.util.LinkedHashMap<>();
        data.put("id", user.getId());
        data.put("email", user.getEmail());
        data.put("name", user.getName());
        data.put("country", user.getCountry());
        data.put("role", user.getRole().toString());
        data.put("profileBio", user.getProfileBio());
        data.put("taxId", user.getTaxId());
        data.put("vatNumber", user.getVatNumber());
        data.put("tradeRegisterNumber", user.getTradeRegisterNumber());
        data.put("addressStreet", user.getAddressStreet());
        data.put("addressCity", user.getAddressCity());
        data.put("addressPostalCode", user.getAddressPostalCode());
        data.put("kycVerified", user.getKycVerified());
        data.put("selfCertifiedCompliant", user.getSelfCertifiedCompliant());
        data.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        data.put("lastLoginAt", user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null);
        data.put("exportedAt", java.time.Instant.now().toString());
        return data;
    }

    /**
     * GDPR Compliance — Persist consent audit trail.
     * Hashes IP and User-Agent using SHA-256 for privacy protection.
     */
    @Transactional
    public ConsentLog recordConsent(String userId, String consentType, String consentVersion, boolean granted, String ip, String userAgent) {
        String ipHash = null;
        String userAgentHash = null;
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            if (ip != null) {
                byte[] hash = digest.digest(ip.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) hexString.append('0');
                    hexString.append(hex);
                }
                ipHash = hexString.toString();
            }
            if (userAgent != null) {
                byte[] hash = digest.digest(userAgent.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) hexString.append('0');
                    hexString.append(hex);
                }
                userAgentHash = hexString.toString();
            }
        } catch (java.security.NoSuchAlgorithmException e) {
            // Fallback silently if digest algorithm is not found
        }

        ConsentLog consentLog = new ConsentLog();
        consentLog.setUserId(userId);
        consentLog.setConsentType(consentType);
        consentLog.setConsentVersion(consentVersion);
        consentLog.setGranted(granted);
        consentLog.setIpHash(ipHash);
        consentLog.setUserAgentHash(userAgentHash);
        return consentLogRepository.save(consentLog);
    }
}
