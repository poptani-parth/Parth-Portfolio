package com.parth.portfolio.portfolio.education.dto;

public record EducationResponse(
        String id,
        String institution,
        String degree,
        String field,
        String startDate,
        String endDate,
        String grade,
        String description,
        Integer displayOrder
) {
}