package com.eushop.core.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.eushop.core.entity.Food;
import com.eushop.core.repository.FoodRepository;

@ExtendWith(MockitoExtension.class)
public class FoodServiceTest {

    @Mock
    private FoodRepository foodRepository;

    @InjectMocks
    private FoodService foodService;

    private Food mockFood;

    @BeforeEach
    void setUp() {
        mockFood = new Food();
        mockFood.setId("food-123");
        mockFood.setName("Belgian Chocolate Truffles");
        mockFood.setDescription("Authentic dark chocolates");
        mockFood.setPrice(24.99);
        mockFood.setCountry("BE");
        mockFood.setCategory("Chocolates");
        mockFood.setAllergens("[\"Milk\", \"Nuts\"]");
        mockFood.setDietaryRestrictions("[\"Vegetarian\", \"Gluten-Free\"]");
        mockFood.setViewCount(5);
        mockFood.setAvailable(true);
    }

    @Test
    void testCreateFood_Success() {
        when(foodRepository.save(any(Food.class))).thenReturn(mockFood);

        Food created = foodService.createFood(mockFood, "seller-999");

        assertNotNull(created);
        assertEquals("seller-999", created.getSellerId());
        assertTrue(created.getAvailable());
        verify(foodRepository, times(1)).save(mockFood);
    }

    @Test
    void testGetFoodById_IncrementsViewCount() {
        when(foodRepository.findById("food-123")).thenReturn(Optional.of(mockFood));
        when(foodRepository.save(any(Food.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Food> result = foodService.getFoodById("food-123");

        assertTrue(result.isPresent());
        assertEquals(6, result.get().getViewCount()); // Should increment from 5 to 6
        verify(foodRepository, times(1)).findById("food-123");
        verify(foodRepository, times(1)).save(mockFood);
    }

    @Test
    void testUpdateFood_Success() {
        when(foodRepository.findById("food-123")).thenReturn(Optional.of(mockFood));
        when(foodRepository.save(any(Food.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Food updateDetails = new Food();
        updateDetails.setName("Updated Chocolates");
        updateDetails.setDescription("Updated Description");
        updateDetails.setCategory("Gifts");
        updateDetails.setPrice(29.99);
        updateDetails.setCountry("BE");
        updateDetails.setAllergens("[\"Nuts\"]");
        updateDetails.setDietaryRestrictions("[\"Vegan\"]");

        Food updated = foodService.updateFood("food-123", updateDetails);

        assertNotNull(updated);
        assertEquals("Updated Chocolates", updated.getName());
        assertEquals("Updated Description", updated.getDescription());
        assertEquals(29.99, updated.getPrice());
        assertEquals("[\"Nuts\"]", updated.getAllergens());
        assertEquals("[\"Vegan\"]", updated.getDietaryRestrictions());
        verify(foodRepository, times(1)).findById("food-123");
        verify(foodRepository, times(1)).save(mockFood);
    }

    @Test
    void testCreateFood_AllergenDataIntegrity() {
        when(foodRepository.save(any(Food.class))).thenReturn(mockFood);

        Food created = foodService.createFood(mockFood, "seller-999");

        assertNotNull(created);
        assertEquals("[\"Milk\", \"Nuts\"]", created.getAllergens());
        assertEquals("[\"Vegetarian\", \"Gluten-Free\"]", created.getDietaryRestrictions());
        verify(foodRepository, times(1)).save(mockFood);
    }

    @Test
    void testDeleteFood_Success() {
        doNothing().when(foodRepository).deleteById("food-123");

        foodService.deleteFood("food-123");

        verify(foodRepository, times(1)).deleteById("food-123");
    }

    @Test
    void searchFoods_CombinesQueryAndFilters() {
        var page = new PageImpl<>(List.of(mockFood), PageRequest.of(0, 10), 1);
        when(foodRepository.advancedSearch("chocolate", "BE", "Chocolates", null, PageRequest.of(0, 10)))
                .thenReturn(page);

        var result = foodService.searchFoods("chocolate", "BE", "Chocolates", 0, 10);

        assertEquals(1, result.getTotalElements());
        verify(foodRepository).advancedSearch("chocolate", "BE", "Chocolates", null, PageRequest.of(0, 10));
        verify(foodRepository, never()).searchByNameOrDescription(anyString(), any());
    }
}
