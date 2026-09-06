package com.parth.portfolio.portfolio.security;

import java.time.Instant;

public class LoginRateLimitException extends RuntimeException {
    private final Instant retryAt;
    public LoginRateLimitException(Instant retryAt) { this.retryAt = retryAt; }
    public Instant getRetryAt() { return retryAt; }
}
