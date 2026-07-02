package com.eushop.core.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.dto.UserDTO;
import com.eushop.core.dto.BecomeSellerRequest;
import com.eushop.core.entity.User;
import com.eushop.core.service.UserService;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
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

    @GetMapping("/sellers/country/{country}")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getSellersByCountry(@PathVariable String country) {
        List<UserDTO> sellers = userService.getSellersByCountry(country)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(sellers));
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

    @GetMapping
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

    @PostMapping("/{id}/verify")
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
