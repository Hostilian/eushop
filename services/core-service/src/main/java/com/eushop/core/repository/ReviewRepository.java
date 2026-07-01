package com.eushop.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eushop.core.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {

    Page<Review> findByFoodId(String foodId, Pageable pageable);

    Page<Review> findBySellerId(String sellerId, Pageable pageable);

    Page<Review> findByReviewerId(String reviewerId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.foodId = :foodId")
    Double getAverageRatingByFood(@Param("foodId") String foodId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.sellerId = :sellerId")
    Double getAverageRatingBySeller(@Param("sellerId") String sellerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.verified = true AND r.sellerId = :sellerId")
    Long countVerifiedReviewsBySeller(@Param("sellerId") String sellerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.foodId = :foodId")
    Long countReviewsByFood(@Param("foodId") String foodId);

    Long countBySellerId(String sellerId);

    boolean existsByFoodIdAndReviewerId(String foodId, String reviewerId);

    java.util.List<Review> findByFoodIdOrderByCreatedAtDesc(String foodId);

    java.util.List<Review> findByReviewerId(String reviewerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.foodId = :foodId")
    Long getReviewCountByFood(@Param("foodId") String foodId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.sellerId = :sellerId")
    Long getReviewCountBySeller(@Param("sellerId") String sellerId);
}
