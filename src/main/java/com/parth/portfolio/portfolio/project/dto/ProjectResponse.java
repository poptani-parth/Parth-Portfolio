package com.parth.portfolio.portfolio.project.dto;

import java.util.List;

public record ProjectResponse(

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

        boolean featured
) {
}