package com.parth.portfolio.portfolio.media.dto;

import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record MediaRequest(

        @NotBlank(message = "Name is required")
        @Size(
                max = 200,
                message = "Name must not exceed 200 characters"
        )
        String name,

        @Size(
                max = 500,
                message = "Original file name must not exceed 500 characters"
        )
        String originalFileName,

        @NotBlank(message = "URL is required")
        @Size(
                max = 1000,
                message = "URL must not exceed 1000 characters"
        )
        String url,

        @NotBlank(message = "Type is required")
        @Pattern(
                regexp = "IMAGE|VIDEO|DOCUMENT|AUDIO|OTHER",
                message = "Invalid media type"
        )
        String type,

        @Size(
                max = 150,
                message = "MIME type must not exceed 150 characters"
        )
        String mimeType,

        @PositiveOrZero(message = "Size must be zero or greater")
        Long size,

        @Size(
                max = 300,
                message = "Alt text must not exceed 300 characters"
        )
        String altText,

        @Size(
                max = 500,
                message = "Caption must not exceed 500 characters"
        )
        String caption,

        @Size(
                max = 500,
                message = "Public ID must not exceed 500 characters"
        )
        String publicId,

        @NotBlank(message = "Usage is required")
        @Size(
                max = 50,
                message = "Usage must not exceed 50 characters"
        )
        String usage,

        // @NotNull(message = "Display order is required")
        // @PositiveOrZero(
        //         message = "Display order must be zero or greater"
        // )
        // Integer displayOrder,

        boolean active
) {
}