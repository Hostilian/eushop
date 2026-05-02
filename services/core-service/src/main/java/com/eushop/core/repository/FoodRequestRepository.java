package com.eushop.core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eushop.core.entity.FoodRequest;

@Repository
public interface FoodRequestRepository extends JpaRepository<FoodRequest, String> {
    
    List<FoodRequest> findByBuyerId(String buyerId);
    
    List<FoodRequest> findByCountry(String country);
    
    List<FoodRequest> findByCategory(String category);
    
    @Query("SELECT fr FROM FoodRequest fr WHERE fr.status = 'OPEN' ORDER BY fr.createdAt DESC")
    List<FoodRequest> getOpenRequests();
    
    @Query("SELECT fr FROM FoodRequest fr WHERE fr.country = :country AND fr.status = 'OPEN' ORDER BY fr.createdAt DESC")
    List<FoodRequest> getOpenRequestsByCountry(@Param("country") String country);
    
    @Query("SELECT fr FROM FoodRequest fr WHERE fr.category = :category AND fr.status = 'OPEN' ORDER BY fr.createdAt DESC")
    List<FoodRequest> getOpenRequestsByCategory(@Param("category") String category);
}
