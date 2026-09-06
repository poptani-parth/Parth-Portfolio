package com.parth.portfolio.portfolio.admin.dto;

public record IssuedTokens(
        String accessToken,
        String refreshToken,
        TokenResponse response
) {
}