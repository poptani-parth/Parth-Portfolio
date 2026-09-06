package com.parth.portfolio.common.exception;

public class TokenReuseDetectedException extends RuntimeException {
    public TokenReuseDetectedException() {
        super("Refresh token reuse detected");
    }
}
