package com.parth.portfolio.portfolio.profile.dto;

import com.parth.portfolio.common.validation.ValidUrl;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileRequest(

        @NotBlank(message = "Name is required")
        @Size(
                max = 120,
                message = "Name must not exceed 120 characters"
        )
        String name,

        @NotBlank(message = "Hero title is required")
        @Size(
                max = 200,
                message = "Hero title must not exceed 200 characters"
        )
        String heroTitle,

        @Size(
                max = 300,
                message = "Hero subtitle must not exceed 300 characters"
        )
        String heroSubtitle,

        @Size(
                max = 5000,
                message = "Bio must not exceed 5000 characters"
        )
        String bio,

        @Email(message = "Please provide a valid email address")
        @Size(
                max = 150,
                message = "Email must not exceed 150 characters"
        )
        String email,

        @Size(
                max = 30,
                message = "Phone must not exceed 30 characters"
        )
        String phone,

        @Size(
                max = 150,
                message = "Location must not exceed 150 characters"
        )
        String location,

        @ValidUrl(allowHttp = true)
        @Size(
                max = 500,
                message = "Resume URL must not exceed 500 characters"
        )
        String resumeUrl,

        @ValidUrl(allowHttp = true)
        @Size(
                max = 500,
                message = "GitHub URL must not exceed 500 characters"
        )
        String githubUrl,

        @ValidUrl(allowHttp = true)
        @Size(
                max = 500,
                message = "LinkedIn URL must not exceed 500 characters"
        )
        String linkedinUrl,

        @ValidUrl
        @Size(
                max = 500,
                message = "Profile image URL must not exceed 500 characters"
        )
        String profileImageUrl,

        boolean active
) {
}
