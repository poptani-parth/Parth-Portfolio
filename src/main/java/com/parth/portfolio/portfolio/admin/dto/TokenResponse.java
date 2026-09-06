package com.parth.portfolio.portfolio.admin.dto;

public record TokenResponse(
        String tokenType,
        long expiresIn,
        String username,
        String role
) {
}
