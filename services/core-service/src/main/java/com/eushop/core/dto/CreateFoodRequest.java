package com.eushop.core.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFoodRequest {
    @NotBlank(message = "Food name is required")
    @Size(max = 150, message = "Food name must be under 150 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must be under 2000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must be under 100 characters")
    private String category;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be positive")
    @Max(value = 100000, message = "Price must be under 100,000")
    private Double price;

    @NotNull(message = "Finder fee is required")
    @Min(value = 0, message = "Finder fee must be positive")
    @Max(value = 10000, message = "Finder fee must be under 10,000")
    private Double finderFee;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must be under 100 characters")
    private String country;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be positive")
    @Max(value = 100000, message = "Quantity must be under 100,000")
    private Integer quantity;

    @Size(max = 1000, message = "Dietary restrictions list must be under 1000 characters")
    private String dietaryRestrictions;

    @NotBlank(message = "Allergens selection is required")
    @Size(max = 1000, message = "Allergens list must be under 1000 characters")
    private String allergens;

    @Size(max = 2000, message = "Image URLs string must be under 2000 characters")
    private String images;
}
