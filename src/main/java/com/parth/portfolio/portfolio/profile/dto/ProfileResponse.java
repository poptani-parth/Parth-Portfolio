package com.parth.portfolio.portfolio.profile.dto;

public record ProfileResponse(

        String name,

        String heroTitle,

        String heroSubtitle,

        String bio,

        String email,

        String phone,

        String location,

        String resumeUrl,

        String githubUrl,

        String linkedinUrl,

        String profileImageUrl
) {
}
