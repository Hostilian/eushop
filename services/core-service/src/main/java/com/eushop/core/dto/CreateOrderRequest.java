package com.eushop.core.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Buyer-controlled fields for a new order; prices and payment state remain server-controlled. */
@Data
public class CreateOrderRequest {
    @NotBlank(message = "Food id is required")
    private String foodId;
    @NotNull(message = "Quantity is required") @Min(value = 1, message = "Quantity must be at least 1") @Max(value = 1000, message = "Quantity must be at most 1000")
    private Integer quantity;
    @Size(max = 500, message = "Message must be at most 500 characters")
    private String message;
    @Size(max = 2000, message = "Shipping address must be at most 2000 characters")
    private String shippingAddress;
}
