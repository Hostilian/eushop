package com.eushop.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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
<<<<<<< HEAD

    /**
     * GDPR Article 17 — Right to Erasure.
     * Clears PII from reviews (comment, highlights, improvements) for a given user.
     * Called when a user exercises their right to be forgotten (as reviewer or seller).
     */
    @Transactional
    @Modifying
    @Query("UPDATE Review r SET r.comment = NULL, r.highlights = NULL, r.improvements = NULL WHERE r.reviewerId = :userId OR r.sellerId = :userId")
    void updateReviewPiiWhereReviewerIdOrSellerId(@Param("userId") String userId);
=======
>>>>>>> pull-1
}
