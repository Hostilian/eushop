package com.eushop.core.controller;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.dto.UserDTO;
import com.eushop.core.entity.User;
import com.eushop.core.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> credentials,
            HttpServletResponse response) {
        
        String email = credentials.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        // Fetch or create user (mocking Auth0 user persistence)
        User user = userService.getUserByEmail(email)
                .orElseGet(() -> {
                    String name = email.split("@")[0].toUpperCase();
                    String auth0Sub = "auth0|mock-" + UUID.randomUUID().toString();
                    return userService.createUser(email, name, "DE", auth0Sub);
                });

        userService.updateLastLogin(user.getId());

        // Generate base64 mock token claims that JwtAuthenticationFilter can decode
        String mockTokenClaims = String.format(
                "{\"sub\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}",
                user.getId(), user.getEmail(), user.getRole().name()
        );
        String token = Base64.getEncoder().encodeToString(mockTokenClaims.getBytes());

        // Set HttpOnly Cookie
        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(false) // Set to false for localhost HTTP compatibility, true in production HTTPS
                .path("/")
                .maxAge(86400) // 24 hours
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        UserDTO userDto = toDTO(user);
        log.info("Successfully logged in user {} and set httpOnly token cookie", user.getId());

        return ResponseEntity.ok(Map.of(
                "message", "Mock login successful",
                "user", userDto
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(
            @RequestBody Map<String, String> payload,
            HttpServletResponse response) {
        
        String email = payload.get("email");
        String name = payload.get("name");
        String country = payload.get("country");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        if (userService.getUserByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered"));
        }

        String auth0Sub = "auth0|mock-" + UUID.randomUUID().toString();
        User user = userService.createUser(
                email,
                name != null ? name : email.split("@")[0].toUpperCase(),
                country != null ? country : "DE",
                auth0Sub
        );

        // Generate base64 mock token claims
        String mockTokenClaims = String.format(
                "{\"sub\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}",
                user.getId(), user.getEmail(), user.getRole().name()
        );
        String token = Base64.getEncoder().encodeToString(mockTokenClaims.getBytes());

        // Set HttpOnly Cookie
        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(86400)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        UserDTO userDto = toDTO(user);
        log.info("Successfully registered user {} and set httpOnly token cookie", user.getId());

        return ResponseEntity.ok(Map.of(
                "message", "Mock signup successful",
                "user", userDto
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletResponse response) {
        // Clear HttpOnly Cookie
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        log.info("Cleared token cookie on logout");

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        return userService.getUserById(userId)
                .map(user -> ResponseEntity.ok(ApiResponse.success(toDTO(user))))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not found")));
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setCountry(user.getCountry());
        dto.setRole(user.getRole().name());
        dto.setKycVerified(Boolean.TRUE.equals(user.getKycVerified()));
        dto.setSelfCertifiedCompliant(Boolean.TRUE.equals(user.getSelfCertifiedCompliant()));
        dto.setTaxId(user.getTaxId());
        dto.setVatNumber(user.getVatNumber());
        dto.setTradeRegisterNumber(user.getTradeRegisterNumber());
        dto.setAddressStreet(user.getAddressStreet());
        dto.setAddressCity(user.getAddressCity());
        dto.setAddressPostalCode(user.getAddressPostalCode());
        return dto;
    }
}
