package com.parth.portfolio.portfolio.admin.dto;

import java.time.Instant;

public record AdminProfileResponse(
        String id,
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
        String profileImageUrl,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}