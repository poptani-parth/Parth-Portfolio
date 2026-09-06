package com.parth.portfolio.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that a URL field uses an allowed scheme.
 *
 * <ul>
 *   <li>{@code https://} is always accepted.</li>
 *   <li>{@code http://} is accepted only when {@link #allowHttp()} is {@code true}.</li>
 *   <li>Any other scheme (javascript:, data:, ftp:, etc.) is rejected.</li>
 *   <li>Null and blank values are accepted (use @NotBlank separately if required).</li>
 * </ul>
 */
@Documented
@Constraint(validatedBy = UrlValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.ANNOTATION_TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidUrl {

    String message() default "URL must use https:// scheme (http:// is not allowed)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /**
     * When {@code true}, {@code http://} URLs are also accepted in addition to
     * {@code https://}. Use this for fields that may legitimately point to
     * non-TLS resources (e.g. a live-demo URL during local development).
     *
     * <p>Default is {@code false} ? only {@code https://} is accepted.</p>
     */
    boolean allowHttp() default false;
}