package com.parth.portfolio.portfolio.contact.exception;

public class ContactRateLimitExceededException extends RuntimeException {

    public ContactRateLimitExceededException(String message) {
        super(message);
    }
}