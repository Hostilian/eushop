package com.eushop.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record MarketplaceCheckoutRequest(
        @NotEmpty @Size(max = 100)
        List<@Valid MarketplaceCheckoutLineRequest> items,

        @NotBlank
        @Pattern(regexp = "^[A-Za-z]{2}$")
        String destinationCountryIso2,

        @NotBlank
        @Size(max = 500)
        String shippingAddress) {
}
