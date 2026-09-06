package com.parth.portfolio.portfolio.admin.dto;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Admin response DTO for Experience.
 *
 * Includes all fields the admin UI needs, including audit timestamps
 * and the active flag ? fields intentionally omitted from the public
 * ExperienceResponse to minimise the public API surface.
 */
public record AdminExperienceResponse(
        String id,
        String company,
        String position,
        String location,
        String employmentType,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        boolean current,
        Integer displayOrder,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}