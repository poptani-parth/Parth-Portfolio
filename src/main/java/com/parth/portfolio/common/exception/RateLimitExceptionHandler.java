package com.parth.portfolio.common.exception;

import com.parth.portfolio.portfolio.contact.exception.ContactRateLimitExceededException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class RateLimitExceptionHandler {

    @ExceptionHandler(ContactRateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handle(
            ContactRateLimitExceededException exception,
            HttpServletRequest request) {

        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .message(exception.getMessage())
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, "3600")
                .body(response);
    }
}
