package com.parth.portfolio.common.exception;

/**
 * Indicates that a refresh request lost an atomic rotation race.
 * This is not token theft/reuse; the client should retry using the
 * replacement HttpOnly refresh cookie.
 */
public class ConcurrentRefreshException extends RuntimeException {
    public ConcurrentRefreshException() {
        super("Refresh rotation is already in progress");
    }
}
