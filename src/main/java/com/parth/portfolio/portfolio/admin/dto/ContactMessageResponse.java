package com.parth.portfolio.portfolio.admin.dto;

import com.parth.portfolio.common.enums.ContactMessageStatus;

import java.time.Instant;

public record ContactMessageResponse(

        String id,

        String name,

        String email,

        String subject,

        String message,

        ContactMessageStatus status,

        Instant readAt,

        Instant archivedAt,

        Instant createdAt
) {
}
