package com.eushop.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFoodRequest {
    @NotBlank(message = "Food name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be positive")
    private Double price;

    @NotNull(message = "Finder fee is required")
    @Min(value = 0, message = "Finder fee must be positive")
    private Double finderFee;

    @NotBlank(message = "Country is required")
    private String country;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be positive")
    private Integer quantity;

    private String dietaryRestrictions;

    @NotBlank(message = "Allergens selection is required")
    private String allergens;

    private String images;
}
