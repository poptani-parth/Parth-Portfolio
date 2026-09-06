package com.parth.portfolio.portfolio.admin.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ExperienceRequest(

        @NotBlank(message = "Company is required")
        @Size(
                max = 200,
                message = "Company must not exceed 200 characters"
        )
        String company,

        @NotBlank(message = "Position is required")
        @Size(
                max = 150,
                message = "Position must not exceed 150 characters"
        )
        String position,

        @Size(
                max = 150,
                message = "Location must not exceed 150 characters"
        )
        String location,

        @Size(
                max = 100,
                message = "Employment type must not exceed 100 characters"
        )
        String employmentType,

        @Size(
                max = 5000,
                message = "Description must not exceed 5000 characters"
        )
        String description,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        LocalDate endDate,

        boolean current,

        @NotNull(message = "Display order is required")
        @PositiveOrZero(
                message = "Display order must be zero or greater"
        )
        Integer displayOrder,

        boolean active
) {

    @AssertTrue(message = "End date is required when experience is not current")
    public boolean isEndDateValid() {
        return current || endDate != null;
    }

    @AssertTrue(message = "End date cannot be before start date")
    public boolean isDateRangeValid() {
        return endDate == null ||
                startDate == null ||
                !endDate.isBefore(startDate);
    }

    @AssertTrue(message = "Current experience cannot have an end date")
    public boolean isCurrentDateValid() {
        return !current || endDate == null;
    }
}