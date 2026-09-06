package com.parth.portfolio.portfolio.media.dto;

import java.time.Instant;

public record MediaResponse(

        String id,

        String name,

        String originalFileName,

        String url,

        String type,

        String mimeType,

        Long size,

        String altText,

        String caption,

        String usage,

        boolean active,

        Instant createdAt
) {
}
