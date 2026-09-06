package com.parth.portfolio.portfolio.skill.dto;

public record SkillResponse(
        String id,
        String name,
        Integer displayOrder,
        String category,
        String description,
        Double yearsExperience,
        Integer proficiencyPercent,
        String proficiencyLevel
) {
}