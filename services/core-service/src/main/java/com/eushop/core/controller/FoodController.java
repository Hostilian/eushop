package com.eushop.core.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
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

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.dto.CreateFoodRequest;
import com.eushop.core.dto.FoodDTO;
import com.eushop.core.dto.UserDTO;
import com.eushop.core.entity.Food;
import com.eushop.core.service.FoodService;
import com.eushop.core.service.UserService;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodService foodService;
    private final UserService userService;

    public FoodController(FoodService foodService, UserService userService) {
        this.foodService = foodService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FoodDTO>>> listFoods(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String category) {
        
        Page<Food> foods = foodService.searchFoods(query, country, category, page, size);
        Page<FoodDTO> dtos = foods.map(this::toDTO);
        
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodDTO>> getFoodById(@PathVariable String id) {
        return foodService.getFoodById(id)
                .map(food -> ResponseEntity.ok(ApiResponse.success(toDTO(food))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Food not found")));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<FoodDTO>>> getTrendingFoods(
            @RequestParam(defaultValue = "BE") String country) {
        
        List<FoodDTO> foods = foodService.getTrendingFoods(country)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(foods));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FoodDTO>> createFood(
            @RequestBody CreateFoodRequest request,
            @RequestHeader("X-User-Id") String userId) {

        // DSA Article 31 — "trader" verification gate.
        // Only KYC-verified sellers may publish listings on the platform.
        var seller = userService.getUserById(userId).orElse(null);
        if (seller == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not found"));
        }
        if (seller.getRole() != com.eushop.core.entity.User.UserRole.SELLER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only sellers may create listings. Please complete seller registration."));
        }
        if (!Boolean.TRUE.equals(seller.getKycVerified())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("DSA_VERIFICATION_REQUIRED: Your seller account is pending admin verification. You will be notified when your KYC check is complete."));
        }

        Food food = new Food();
        food.setName(request.getName());
        food.setDescription(request.getDescription());
        food.setCategory(request.getCategory());
        food.setPrice(request.getPrice());
        food.setFinderFee(request.getFinderFee());
        food.setCountry(request.getCountry());
        food.setQuantity(request.getQuantity());
        food.setDietaryRestrictions(request.getDietaryRestrictions());
        food.setAllergens(request.getAllergens());
        food.setImages(request.getImages());

        Food created = foodService.createFood(food, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toDTO(created), "Food created successfully"));
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodDTO>> updateFood(
            @PathVariable String id,
            @RequestBody CreateFoodRequest request,
            @RequestHeader("X-User-Id") String userId) {
        
        Food existingFood = foodService.getFoodById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));
        
        if (!existingFood.getSellerId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only seller can update this food"));
        }

        // DSA Article 31 — "trader" verification gate for updates
        var seller = userService.getUserById(userId).orElse(null);
        if (seller == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not found"));
        }
        if (!Boolean.TRUE.equals(seller.getKycVerified())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("DSA_VERIFICATION_REQUIRED: Your seller account is pending admin verification. You cannot update listings."));
        }

        Food food = new Food();
        food.setName(request.getName());
        food.setDescription(request.getDescription());
        food.setCategory(request.getCategory());
        food.setPrice(request.getPrice());
        food.setFinderFee(request.getFinderFee());
        food.setCountry(request.getCountry());
        food.setQuantity(request.getQuantity());
        food.setDietaryRestrictions(request.getDietaryRestrictions());
        food.setAllergens(request.getAllergens());
        food.setImages(request.getImages());

        Food updated = foodService.updateFood(id, food);
        
        return ResponseEntity.ok(ApiResponse.success(toDTO(updated), "Food updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFood(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        
        Food food = foodService.getFoodById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));
        
        if (!food.getSellerId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only seller can delete this food"));
        }

        foodService.deleteFood(id);
        
        return ResponseEntity.ok(ApiResponse.success(null, "Food deleted successfully"));
    }

    @PostMapping("/{id}/toggle-availability")
    public ResponseEntity<ApiResponse<FoodDTO>> toggleAvailability(
            @PathVariable String id,
            @RequestParam boolean available,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader("X-User-Id") String userId) {
        
        Food food = foodService.getFoodById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));
        
        if (!food.getSellerId().equals(userId) && !"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only seller or admin can modify this food"));
        }

        if (available) {
            var seller = userService.getUserById(food.getSellerId()).orElse(null);
            if (seller == null || !Boolean.TRUE.equals(seller.getKycVerified())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("DSA_VERIFICATION_REQUIRED: Your seller account must be KYC-verified before making listings available."));
            }
        }

        foodService.toggleAvailability(id, available);
        
        Food updated = foodService.getFoodById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));
        return ResponseEntity.ok(ApiResponse.success(toDTO(updated), "Food availability updated"));
    }

    /**
     * Search foods using advanced query parameters and high-performance trigram matching.
     * Request parameters:
     * - q: search query string (matches name/description, nullable)
     * - country: source country filter (nullable)
     * - category: food category filter (nullable)
     * - allergenFree: allergen to exclude (nullable)
     * - page: 0-indexed page number (default 0)
     * - size: items per page (default 10)
     * 
     * Response shape: ApiResponse containing a Page of FoodDTOs.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<FoodDTO>>> searchFoods(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String allergenFree,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<Food> foods = foodService.advancedSearch(q, country, category, allergenFree, page, size);
        Page<FoodDTO> dtos = foods.map(this::toDTO);
        return ResponseEntity.ok(ApiResponse.success(dtos, "Search results fetched successfully"));
    }

    private FoodDTO toDTO(Food food) {
        FoodDTO dto = new FoodDTO();
        dto.setId(food.getId());
        dto.setName(food.getName());
        dto.setDescription(food.getDescription());
        dto.setCategory(food.getCategory());
        dto.setPrice(food.getPrice());
        dto.setFinderFee(food.getFinderFee());
        dto.setCountry(food.getCountry());
        dto.setQuantity(food.getQuantity());
        dto.setDietaryRestrictions(food.getDietaryRestrictions());
        dto.setAllergens(food.getAllergens());
        dto.setImages(food.getImages());
        dto.setAvailable(food.getAvailable());
        dto.setAverageRating(food.getAverageRating());
        dto.setReviewCount(food.getReviewCount());
        dto.setViewCount(food.getViewCount());
        dto.setSalesCount(food.getSalesCount());

        if (food.getSeller() != null) {
            UserDTO sellerDTO = new UserDTO();
            sellerDTO.setId(food.getSeller().getId());
            sellerDTO.setName(food.getSeller().getName());
            sellerDTO.setAverageRating(food.getSeller().getAverageRating());
            sellerDTO.setKycVerified(food.getSeller().getKycVerified());
            dto.setSeller(sellerDTO);
        }

        return dto;
    }
}
