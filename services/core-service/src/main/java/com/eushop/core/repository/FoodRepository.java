package com.eushop.core.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eushop.core.entity.Food;

@Repository
public interface FoodRepository extends JpaRepository<Food, String> {

    @EntityGraph(attributePaths = {"seller"})
    Page<Food> findByAvailableTrue(Pageable pageable);

    @EntityGraph(attributePaths = {"seller"})
    Page<Food> findByCategory(String category, Pageable pageable);

    @EntityGraph(attributePaths = {"seller"})
    Page<Food> findByCountry(String country, Pageable pageable);

    @EntityGraph(attributePaths = {"seller"})
    Page<Food> findBySellerId(String sellerId, Pageable pageable);

    @EntityGraph(attributePaths = {"seller"})
    @Query("SELECT f FROM Food f WHERE f.available = true AND " +
           "(LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Food> searchByNameOrDescription(@Param("query") String query, Pageable pageable);

    @EntityGraph(attributePaths = {"seller"})
    @Query("SELECT f FROM Food f WHERE f.country = :country AND f.available = true ORDER BY f.averageRating DESC")
    List<Food> findTrendingByCountry(@Param("country") String country, Pageable pageable);

    @EntityGraph(attributePaths = {"seller"})
    @Query("SELECT f FROM Food f WHERE f.available = true ORDER BY f.viewCount DESC LIMIT 10")
    List<Food> findMostViewed();

    @EntityGraph(attributePaths = {"seller"})
    @Query("SELECT f FROM Food f WHERE f.available = true ORDER BY f.averageRating DESC LIMIT 10")
    List<Food> findTopRated();

    @EntityGraph(attributePaths = {"seller"})
    @Query("SELECT f FROM Food f WHERE f.available = true ORDER BY f.createdAt DESC LIMIT 10")
    List<Food> findNewest();

    Long countBySellerId(String sellerId);

    Long countByAvailableTrue();
}
