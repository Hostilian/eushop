package com.eushop.core.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record MarketplaceCheckoutLineRequest(
        @NotBlank String foodId,
        @Min(1) @Max(100) int quantity) {
}
