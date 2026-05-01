package com.eushop.core.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFoodRequest {
    private String name;
    private String description;
    private String category;
    private Double price;
    private Double finderFee;
    private String country;
    private Integer quantity;
    private String dietaryRestrictions;
    private String images;
}
