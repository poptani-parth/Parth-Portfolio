package com.parth.portfolio.common.exception;

import java.time.Instant;
import java.util.Map;

public class ErrorResponse {

    private final boolean success;
    private final String message;
    private final String path;
    private final Instant timestamp;
    private final Map<String, String> errors;

    private ErrorResponse(Builder builder) {
        this.success = builder.success;
        this.message = builder.message;
        this.path = builder.path;
        this.timestamp = builder.timestamp;
        this.errors = builder.errors;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public Map<String, String> getErrors() {
        return errors;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private boolean success;
        private String message;
        private String path;
        private Instant timestamp;
        private Map<String, String> errors;

        public Builder success(boolean success) {
            this.success = success;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder path(String path) {
            this.path = path;
            return this;
        }

        public Builder timestamp(Instant timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder errors(Map<String, String> errors) {
            this.errors = errors;
            return this;
        }

        public ErrorResponse build() {
            return new ErrorResponse(this);
        }
    }
}