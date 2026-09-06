package com.parth.portfolio.portfolio.experience.dto;

import java.time.LocalDate;

public record ExperienceResponse(

        String id,

        String company,

        String position,

        String location,

        String employmentType,

        String description,

        LocalDate startDate,

        LocalDate endDate,

        boolean current,

        Integer displayOrder
) {
}