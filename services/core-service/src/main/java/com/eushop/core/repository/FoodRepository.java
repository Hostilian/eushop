package com.eushop.core.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eushop.core.entity.Food;

@Repository
public interface FoodRepository extends JpaRepository<Food, String> {

    Page<Food> findByAvailableTrue(Pageable pageable);

    Page<Food> findByCategory(String category, Pageable pageable);

    Page<Food> findByCountry(String country, Pageable pageable);

    Page<Food> findBySellerId(String sellerId, Pageable pageable);

    @Query("SELECT f FROM Food f WHERE f.available = true AND " +
           "(LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Food> searchByNameOrDescription(@Param("query") String query, Pageable pageable);

    @Query("SELECT f FROM Food f WHERE f.country = :country AND f.available = true ORDER BY f.averageRating DESC")
    List<Food> findTrendingByCountry(@Param("country") String country, Pageable pageable);

    @Query("SELECT f FROM Food f WHERE f.available = true ORDER BY f.viewCount DESC LIMIT 10")
    List<Food> findMostViewed();

    @Query("SELECT f FROM Food f WHERE f.available = true ORDER BY f.averageRating DESC LIMIT 10")
    List<Food> findTopRated();

    @Query("SELECT f FROM Food f WHERE f.available = true ORDER BY f.createdAt DESC LIMIT 10")
    List<Food> findNewest();

    Long countBySellerId(String sellerId);

    Long countByAvailableTrue();
}
