package com.parth.portfolio.portfolio.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record SkillRequest(
        @NotBlank(message = "Skill name is required") 
        @Size(max = 100, message = "Skill name must not exceed 100 characters") 
        String name,
        
        @NotBlank(message = "Category is required") 
        @Size(max = 100, message = "Category must not exceed 100 characters")
        String category,

        @NotNull(message = "Display order is required") 
        @PositiveOrZero(message = "Display order must be zero or greater") 
        Integer displayOrder,

        @Size(max = 500, message = "Overview must not exceed 500 characters")
        String overview,

        @PositiveOrZero(message = "Years of experience must be zero or greater")
        Double yearsOfExperience,

        @Min(value = 0, message = "Knowledge percentage cannot be less than 0")
        @Max(value = 100, message = "Knowledge percentage cannot exceed 100")
        Integer knowledgePercentage,

        boolean active
    ) {
}