package com.parth.portfolio.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * Constraint validator for {@link ValidUrl}.
 *
 * Accepts null/blank (optional fields), https://, and optionally http://.
 * Rejects all other schemes to prevent javascript:, data:, ftp:, etc.
 */
public class UrlValidator implements ConstraintValidator<ValidUrl, String> {

    private boolean allowHttp;

    @Override
    public void initialize(ValidUrl annotation) {
        this.allowHttp = annotation.allowHttp();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // optional; pair with @NotBlank if the field is required
        }

        String trimmed = value.strip();

        URI uri;
        try {
            uri = new URI(trimmed);
        } catch (URISyntaxException ex) {
            return false;
        }

        String scheme = uri.getScheme();

        if (scheme == null) {
            return false; // relative URLs not accepted
        }

        if ("https".equalsIgnoreCase(scheme)) {
            return true;
        }

        if (allowHttp && "http".equalsIgnoreCase(scheme)) {
            return true;
        }

        // All other schemes (javascript:, data:, ftp:, file:, ...) are rejected.
        return false;
    }
}