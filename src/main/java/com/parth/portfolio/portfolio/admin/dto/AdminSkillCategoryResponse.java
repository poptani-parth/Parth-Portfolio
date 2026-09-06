package com.parth.portfolio.portfolio.admin.dto;

import java.time.Instant;

public record AdminSkillCategoryResponse(
        String id,
        String name,
        String description,
        Integer displayOrder,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}
