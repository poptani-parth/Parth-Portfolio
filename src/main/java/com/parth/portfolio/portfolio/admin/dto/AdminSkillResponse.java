package com.parth.portfolio.portfolio.admin.dto;

import java.time.Instant;

public record AdminSkillResponse(
        String id,
        String name,
        String category,
        Integer displayOrder,
        String overview,
        Double yearsOfExperience,
        Integer knowledgePercentage,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}