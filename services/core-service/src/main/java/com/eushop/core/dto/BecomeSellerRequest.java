package com.eushop.core.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BecomeSellerRequest {

    @NotBlank(message = "Tax ID is required")
    private String taxId;

    private String vatNumber;

    @NotBlank(message = "Trade Register Number is required")
    private String tradeRegisterNumber;

    @NotBlank(message = "Street address is required")
    private String addressStreet;

    @NotBlank(message = "City is required")
    private String addressCity;

    @NotBlank(message = "Postal code is required")
    private String addressPostalCode;

    @AssertTrue(message = "You must self-certify compliance with EU regulations")
    private Boolean selfCertifiedCompliant;
}
