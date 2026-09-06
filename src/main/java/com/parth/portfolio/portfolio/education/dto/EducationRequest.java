package com.parth.portfolio.portfolio.education.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;


public record EducationRequest(

        @NotBlank(message = "Institution is required")
        @Size(max = 200, message = "Institution must not exceed 200 characters")
        String institution,

        @NotBlank(message = "Degree is required")
        @Size(max = 150, message = "Degree must not exceed 150 characters")
        String degree,

        @Size(max = 150, message = "Field must not exceed 150 characters")
        String field,

        @NotNull(message = "Start date is required")
        String startDate,

        String endDate,

        @Size(max = 50, message = "Grade must not exceed 50 characters")
        String grade,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        @NotNull(message = "Display order is required")
        @PositiveOrZero(message = "Display order must be zero or greater")
        Integer displayOrder,

        boolean active
) {
}