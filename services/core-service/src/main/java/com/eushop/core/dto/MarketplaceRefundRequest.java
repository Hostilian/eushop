package com.eushop.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record MarketplaceRefundRequest(
        @Positive long amountCents,
        @NotBlank @Size(max = 500) String reason) {
}
