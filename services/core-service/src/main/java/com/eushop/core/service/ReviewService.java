package com.eushop.core.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.Review;
import com.eushop.core.repository.ReviewRepository;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }

    public Optional<Review> getReviewById(String id) {
        return reviewRepository.findById(id);
    }

    public List<Review> getReviewsByFood(String foodId) {
        return reviewRepository.findByFoodIdOrderByCreatedAtDesc(foodId);
    }

    public List<Review> getReviewsByBuyer(String buyerId) {
        return reviewRepository.findByBuyerId(buyerId);
    }

    public Double getAverageRatingByFood(String foodId) {
        Double rating = reviewRepository.getAverageRatingByFood(foodId);
        return rating != null ? rating : 0.0;
    }

    public Long getReviewCountByFood(String foodId) {
        return reviewRepository.getReviewCountByFood(foodId);
    }

    public Double getAverageRatingBySeller(String sellerId) {
        Double rating = reviewRepository.getAverageRatingBySeller(sellerId);
        return rating != null ? rating : 0.0;
    }

    public Long getReviewCountBySeller(String sellerId) {
        return reviewRepository.getReviewCountBySeller(sellerId);
    }

    public Review updateReview(String id, Review updatedReview) {
        return reviewRepository.findById(id).map(review -> {
            review.setRating(updatedReview.getRating());
            review.setComment(updatedReview.getComment());
            return reviewRepository.save(review);
        }).orElseThrow(() -> new RuntimeException("Review not found"));
    }

    public void deleteReview(String id) {
        reviewRepository.deleteById(id);
    }
}
