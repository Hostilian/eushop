package com.eushop.core.controller;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.dto.CreateFoodRequest;
import com.eushop.core.dto.FoodDTO;
import com.eushop.core.entity.Food;
import com.eushop.core.entity.User;
import com.eushop.core.service.FoodService;
import com.eushop.core.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class FoodControllerTest {

    @Mock
    private FoodService foodService;

    @Mock
    private UserService userService;

    @InjectMocks
    private FoodController foodController;

    private User buyer;
    private User unverifiedSeller;
    private User verifiedSeller;
    private CreateFoodRequest foodRequest;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Setup test users
        buyer = new User();
        buyer.setId("buyer_1");
        buyer.setRole(User.UserRole.BUYER);
        buyer.setKycVerified(false);

        unverifiedSeller = new User();
        unverifiedSeller.setId("seller_1");
        unverifiedSeller.setRole(User.UserRole.SELLER);
        unverifiedSeller.setKycVerified(false);

        verifiedSeller = new User();
        verifiedSeller.setId("seller_2");
        verifiedSeller.setRole(User.UserRole.SELLER);
        verifiedSeller.setKycVerified(true);

        // Setup test food request
        foodRequest = new CreateFoodRequest();
        foodRequest.setName("Test Food");
        foodRequest.setDescription("Test Description");
        foodRequest.setPrice(10.0);
        foodRequest.setCountry("IT");
    }

    @Test
    void createFood_BuyerRole_ReturnsForbidden() {
        when(userService.getUserById("buyer_1")).thenReturn(Optional.of(buyer));

        ResponseEntity<ApiResponse<FoodDTO>> response = foodController.createFood(foodRequest, "buyer_1");

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Only sellers may create listings. Please complete seller registration.", response.getBody().getMessage());
    }

    @Test
    void createFood_UnverifiedSeller_ReturnsForbidden() {
        when(userService.getUserById("seller_1")).thenReturn(Optional.of(unverifiedSeller));

        ResponseEntity<ApiResponse<FoodDTO>> response = foodController.createFood(foodRequest, "seller_1");

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("DSA_VERIFICATION_REQUIRED: Your seller account is pending admin verification. You will be notified when your KYC check is complete.", response.getBody().getMessage());
    }

    @Test
    void createFood_VerifiedSeller_ReturnsCreated() {
        when(userService.getUserById("seller_2")).thenReturn(Optional.of(verifiedSeller));

        Food mockFood = new Food();
        mockFood.setId("food_1");
        mockFood.setName("Test Food");
        when(foodService.createFood(any(Food.class), anyString())).thenReturn(mockFood);

        ResponseEntity<ApiResponse<FoodDTO>> response = foodController.createFood(foodRequest, "seller_2");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Food created successfully", response.getBody().getMessage());
        assertEquals("food_1", response.getBody().getData().getId());
    }

    @Test
    void createFood_UserNotFound_ReturnsUnauthorized() {
        when(userService.getUserById("nonexistent")).thenReturn(Optional.empty());

        ResponseEntity<ApiResponse<FoodDTO>> response = foodController.createFood(foodRequest, "nonexistent");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("User not found", response.getBody().getMessage());
    }
}