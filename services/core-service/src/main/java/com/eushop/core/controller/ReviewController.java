package com.eushop.core.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.entity.Review;
import com.eushop.core.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> createReview(
            @RequestBody Review review,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Review created = reviewService.createReview(review);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Review created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Review>> getReviewById(@PathVariable String id) {
        return reviewService.getReviewById(id)
                .map(review -> ResponseEntity.ok(ApiResponse.success(review)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Review not found")));
    }

    @GetMapping("/food/{foodId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewsByFood(@PathVariable String foodId) {
        List<Review> reviews = reviewService.getReviewsByFood(foodId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewsByBuyer(@PathVariable String buyerId) {
        List<Review> reviews = reviewService.getReviewsByBuyer(buyerId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/food/{foodId}/average-rating")
    public ResponseEntity<ApiResponse<Double>> getAverageRatingByFood(@PathVariable String foodId) {
        Double rating = reviewService.getAverageRatingByFood(foodId);
        return ResponseEntity.ok(ApiResponse.success(rating));
    }

    @GetMapping("/food/{foodId}/count")
    public ResponseEntity<ApiResponse<Long>> getReviewCountByFood(@PathVariable String foodId) {
        Long count = reviewService.getReviewCountByFood(foodId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Review>> updateReview(
            @PathVariable String id,
            @RequestBody Review review,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Review updated = reviewService.updateReview(id, review);
        return ResponseEntity.ok(ApiResponse.success(updated, "Review updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        reviewService.deleteReview(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
