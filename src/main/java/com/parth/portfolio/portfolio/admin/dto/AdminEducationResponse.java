package com.parth.portfolio.portfolio.admin.dto;

import java.time.Instant;

/**
 * Admin response DTO for Education.
 *
 * Includes all fields the admin UI needs, including audit timestamps
 * and the active flag ? fields intentionally omitted from the public
 * EducationResponse to minimise the public API surface.
 */
public record AdminEducationResponse(
        String id,
        String institution,
        String degree,
        String field,
        String startDate,
        String endDate,
        String grade,
        String description,
        Integer displayOrder,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}