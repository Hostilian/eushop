package com.eushop.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.Food;
import com.eushop.core.repository.FoodRepository;

@Service
@Transactional
public class FoodService {

    private final FoodRepository foodRepository;

    public FoodService(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    public Food createFood(Food food, String sellerId) {
        food.setSellerId(sellerId);
        food.setAvailable(true);
        return foodRepository.save(food);
    }

    public Optional<Food> getFoodById(String id) {
        Optional<Food> food = foodRepository.findById(id);
        // Increment view count
        food.ifPresent(f -> {
            f.setViewCount((f.getViewCount() != null ? f.getViewCount() : 0) + 1);
            foodRepository.save(f);
        });
        return food;
    }

    public Page<Food> searchFoods(String query, String country, String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // Combined filtering is intentional; the old branch order discarded country/category
        // whenever q was supplied and returned misleading product results.
        return foodRepository.advancedSearch(query, country, category, null, pageable);
    }

    public Page<Food> getFoodsByCountry(String country, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return foodRepository.findByCountry(country, pageable);
    }

    public List<Food> getTrendingFoods(String country) {
        Pageable pageable = PageRequest.of(0, 10);
        return foodRepository.findTrendingByCountry(country, pageable);
    }

    public List<Food> getMostViewedFoods() {
        return foodRepository.findMostViewed();
    }

    public List<Food> getTopRatedFoods() {
        return foodRepository.findTopRated();
    }

    public List<Food> getNewestFoods() {
        return foodRepository.findNewest();
    }

    public Page<Food> getSellerFoods(String sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return foodRepository.findBySellerId(sellerId, pageable);
    }

    public Food updateFood(String foodId, Food updatedFood) {
        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));

        food.setName(updatedFood.getName());
        food.setDescription(updatedFood.getDescription());
        food.setCategory(updatedFood.getCategory());
        food.setPrice(updatedFood.getPrice());
        food.setFinderFee(updatedFood.getFinderFee());
        food.setQuantity(updatedFood.getQuantity());
        food.setCountry(updatedFood.getCountry());
        food.setDietaryRestrictions(updatedFood.getDietaryRestrictions());
        food.setImages(updatedFood.getImages());
        food.setAllergens(updatedFood.getAllergens());

        return foodRepository.save(food);
    }

    public void deleteFood(String foodId) {
        foodRepository.deleteById(foodId);
    }

    public void toggleAvailability(String foodId, Boolean available) {
        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));
        food.setAvailable(available);
        foodRepository.save(food);
    }

    public Page<Food> advancedSearch(String query, String country, String category, String allergenFree, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return foodRepository.advancedSearch(query, country, category, allergenFree, pageable);
    }
}
