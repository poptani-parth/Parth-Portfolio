package com.parth.portfolio.portfolio.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ReorderItemRequest(

        @NotBlank(message = "ID is required")
        String id,

        @NotNull(message = "Order is required")
        @PositiveOrZero(message = "Order must be zero or greater")
        Integer order
) {
}

