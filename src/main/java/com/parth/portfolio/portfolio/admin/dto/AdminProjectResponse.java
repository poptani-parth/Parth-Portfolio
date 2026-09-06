package com.parth.portfolio.portfolio.admin.dto;

import java.time.Instant;
import java.util.List;

public record AdminProjectResponse(

        String id,

        String title,

        String description,

        String category,

        List<String> technologies,

        String githubUrl,

        String liveUrl,

        String imageUrl,

        String role,

        List<String> features,

        Integer displayOrder,

        boolean featured,

        boolean active,

        Instant createdAt,

        Instant updatedAt
) {
}