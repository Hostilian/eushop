package com.eushop.core.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String email;
    private String name;
    private String country;
    private String role;
    private Float averageRating;
    private Integer reviewCount;
    private Integer completedOrders;
    private String profileBio;
    private String profileImageUrl;
    private Boolean kycVerified;
}
