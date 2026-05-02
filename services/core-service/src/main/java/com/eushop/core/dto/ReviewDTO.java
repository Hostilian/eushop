package com.eushop.core.dto;

import java.time.LocalDateTime;

public class ReviewDTO {
    private String id;
    private String foodId;
    private String foodName;
    private String buyerId;
    private String buyerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewDTO(String id, String foodId, String foodName, String buyerId, String buyerName,
            Integer rating, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.foodId = foodId;
        this.foodName = foodName;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getFoodId() {
        return foodId;
    }

    public String getFoodName() {
        return foodName;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public Integer getRating() {
        return rating;
    }

    public String getComment() {
        return comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
