package com.eushop.core.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodDTO {
    private String id;
    private String name;
    private String description;
    private String category;
    private Double price;
    @JsonProperty("finder_fee")
    private Double finderFee;
    private String country;
    private Integer quantity;
    @JsonProperty("dietary_restrictions")
    private String dietaryRestrictions;
    private String allergens;
    private String images;
    private Boolean available;
    @JsonProperty("average_rating")
    private Float averageRating;
    @JsonProperty("review_count")
    private Integer reviewCount;
    @JsonProperty("view_count")
    private Integer viewCount;
    @JsonProperty("sales_count")
    private Integer salesCount;
    private UserDTO seller;
}
