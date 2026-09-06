package com.parth.portfolio.portfolio.admin.dto;

import com.parth.portfolio.common.validation.ValidUrl;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProjectRequest(

        @NotBlank(message = "Title is required")
        @Size(
                max = 200,
                message = "Title must not exceed 200 characters"
        )
        String title,

        @NotBlank(message = "Description is required")
        @Size(
                max = 5000,
                message = "Description must not exceed 5000 characters"
        )
        String description,

        @NotBlank(message = "Category is required")
        @Size(
                max = 100,
                message = "Category must not exceed 100 characters"
        )
        String category,

        @NotNull(message = "Technologies are required")
        List<
                @NotBlank(
                        message = "Technology cannot be blank"
                )
                String
        > technologies,

        @ValidUrl(allowHttp = true, message = "GitHub URL must use https:// or http:// scheme")
        @Size(max = 500)
        String githubUrl,

        @ValidUrl(allowHttp = true, message = "Live URL must use https:// or http:// scheme")
        @Size(max = 500)
        String liveUrl,

        @ValidUrl(message = "Image URL must use https:// scheme")
        @Size(max = 500)
        String imageUrl,

        @Size(max = 150)
        String role,

        List<
                @Size(
                        max = 500,
                        message = "Feature must not exceed 500 characters"
                )
                String
        > features,

        @NotNull(message = "Display order is required")
        @PositiveOrZero(
                message = "Display order must be zero or greater"
        )
        Integer displayOrder,

        boolean featured,

        boolean active
) {
}