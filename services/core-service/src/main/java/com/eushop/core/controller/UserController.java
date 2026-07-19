package com.eushop.core.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.dto.UserDTO;
import com.eushop.core.dto.BecomeSellerRequest;
import com.eushop.core.entity.User;
import com.eushop.core.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(ApiResponse.success(toDTO(user))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found")));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(user -> ResponseEntity.ok(ApiResponse.success(toDTO(user))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found")));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(
            @RequestHeader("X-User-Id") String userId) {

        return userService.getUserById(userId)
                .map(user -> {
                    userService.updateLastLogin(userId);
                    return ResponseEntity.ok(ApiResponse.success(toDTO(user)));
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not found")));
    }

    @GetMapping("/sellers/top")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getTopSellers() {
        List<UserDTO> sellers = userService.getTopSellers()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(sellers));
    }

    @GetMapping("/sellers/{country}")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getSellersByCountry(@PathVariable String country) {
        List<UserDTO> sellers = userService.getSellersByCountry(country)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(sellers));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestParam(required = false) String role) {

        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only admins can list users"));
        }

        List<User> users;
        if (role != null) {
            users = userService.getUsersByRole(User.UserRole.valueOf(role.toUpperCase()));
        } else {
            users = userService.getAllUsers();
        }

        List<UserDTO> dtos = users.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping("/{id}/become-seller")
    public ResponseEntity<ApiResponse<UserDTO>> becomeSeller(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody BecomeSellerRequest request) {

        if (!id.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Cannot update other user"));
        }

        User user = userService.becomeSeller(id, request);

        return ResponseEntity.ok(ApiResponse.success(toDTO(user), "Now a seller"));
    }

    @GetMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<UserDTO>> verifySeller(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestParam boolean verified) {

        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only admins can verify sellers"));
        }

        User user = userService.verifySeller(id, verified);
        return ResponseEntity.ok(ApiResponse.success(toDTO(user), "Seller verification status updated"));
    }

    @DeleteMapping("/{id}/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {

        if (!id.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Cannot delete other user's account"));
        }

        userService.anonymiseUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Account successfully anonymised (GDPR erasure completed)"));
    }

    // NEW: GDPR Art. 17 erasure endpoint
    @DeleteMapping("/{id}/erase")
    public ResponseEntity<ApiResponse<Void>> eraseUserData(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {

        if (!id.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Cannot erase other user's data"));
        }

        userService.anonymiseUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User data erased (GDPR Article 17 - Right to be Forgotten)"));
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<ApiResponse<Map<String, Object>>> exportAccount(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {

        if (!id.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Cannot export other user's data"));
        }

        Map<String, Object> data = userService.exportUserData(id);
        return ResponseEntity.ok(ApiResponse.success(data, "User data exported successfully (GDPR portability)"));
    }

    @PostMapping("/{id}/consent")
    public ResponseEntity<ApiResponse<Void>> recordConsent(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> requestBody,
            jakarta.servlet.http.HttpServletRequest request) {

        if (!id.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Cannot record consent for other user"));
        }

        String consentType = (String) requestBody.get("consentType");
        String consentVersion = (String) requestBody.get("consentVersion");
        Boolean granted = (Boolean) requestBody.get("granted");

        if (consentType == null || consentVersion == null || granted == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Missing required consent fields"));
        }

        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        userService.recordConsent(id, consentType, consentVersion, granted, ip, userAgent);
        return ResponseEntity.ok(ApiResponse.success(null, "Consent logged successfully"));
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setCountry(user.getCountry());
        dto.setRole(user.getRole().toString());
        dto.setAverageRating(user.getAverageRating());
        dto.setReviewCount(user.getReviewCount());
        dto.setCompletedOrders(user.getCompletedOrders());
        dto.setProfileBio(user.getProfileBio());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setKycVerified(user.getKycVerified());
        dto.setTaxId(user.getTaxId());
        dto.setVatNumber(user.getVatNumber());
        dto.setTradeRegisterNumber(user.getTradeRegisterNumber());
        dto.setAddressStreet(user.getAddressStreet());
        dto.setAddressCity(user.getAddressCity());
        dto.setAddressPostalCode(user.getAddressPostalCode());
        dto.setSelfCertifiedCompliant(user.getSelfCertifiedCompliant());
        return dto;
    }
}