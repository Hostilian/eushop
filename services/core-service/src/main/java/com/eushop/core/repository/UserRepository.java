package com.eushop.core.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eushop.core.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByAuth0Sub(String auth0Sub);

    @Query("SELECT u FROM User u WHERE u.role = 'SELLER' ORDER BY u.averageRating DESC")
    List<User> findTopSellers();

    @Query("SELECT u FROM User u WHERE u.country = :country AND u.role = 'SELLER'")
    List<User> findSellersByCountry(@Param("country") String country);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'SELLER'")
    Long countSellers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'BUYER'")
    Long countBuyers();

    List<User> findByRoleOrderByCreatedAtDesc(User.UserRole role);

    @Query("SELECT u FROM User u WHERE u.role = 'SELLER'")
    List<User> findAllSellers();
}
