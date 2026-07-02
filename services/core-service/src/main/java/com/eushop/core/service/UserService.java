package com.eushop.core.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.User;
import com.eushop.core.repository.UserRepository;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(String email, String name, String country, String auth0Sub) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setCountry(country);
        user.setAuth0Sub(auth0Sub);
        user.setRole(User.UserRole.BUYER);
        user.setEmailVerified(false);
        user.setKycVerified(false);

        return userRepository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserByAuth0Sub(String auth0Sub) {
        return userRepository.findByAuth0Sub(auth0Sub);
    }

    public User updateLastLogin(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User updateProfile(String userId, String name, String profileBio, String country) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setName(name);
        user.setProfileBio(profileBio);
        user.setCountry(country);
        return userRepository.save(user);
    }

    public List<User> getTopSellers() {
        return userRepository.findTopSellers();
    }

    public List<User> getSellersByCountry(String country) {
        return userRepository.findSellersByCountry(country);
    }

    public User becomeSeller(String userId, com.eushop.core.dto.BecomeSellerRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(User.UserRole.SELLER);
        user.setTaxId(request.getTaxId());
        user.setVatNumber(request.getVatNumber());
        user.setTradeRegisterNumber(request.getTradeRegisterNumber());
        user.setAddressStreet(request.getAddressStreet());
        user.setAddressCity(request.getAddressCity());
        user.setAddressPostalCode(request.getAddressPostalCode());
        user.setSelfCertifiedCompliant(request.getSelfCertifiedCompliant());
        user.setKycVerified(false); // Admin must verify seller KYC
        return userRepository.save(user);
    }

    public User verifySeller(String userId, boolean verified) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setKycVerified(verified);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRoleOrderByCreatedAtDesc(role);
    }
}
