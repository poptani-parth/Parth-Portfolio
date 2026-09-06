package com.parth.portfolio.portfolio.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parth.portfolio.common.exception.BadRequestException;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdvice;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Iterator;
import java.util.Map;

/**
 * Rejects JSON request bodies that contain MongoDB operator field names
 * (keys starting with "$") or dotted path keys (e.g. "user.password").
 *
 * <h3>What this does</h3>
 * <ul>
 *   <li>Blocks MongoDB operator injection: {@code $ne}, {@code $gt},
 *       {@code $where}, etc.</li>
 *   <li>Blocks dotted field-path injection: {@code "user.password"}.</li>
 * </ul>
 *
 * <h3>What this does NOT do</h3>
 * <p>This advice does <em>not</em> sanitize or HTML-escape string values.
 * Global HTML sanitization would corrupt passwords, tokens, and other
 * security-sensitive fields that must arrive exactly as submitted.
 * XSS protection must be applied at the rendering layer, not here.</p>
 *
 * <p>Previously named {@code RequestSanitizationAdvice}. Renamed to make the
 * actual scope (MongoDB operator protection) explicit and prevent future
 * developers from assuming XSS sanitization is in place.</p>
 */
@ControllerAdvice
public class MongoOperatorProtectionAdvice implements RequestBodyAdvice {

    private final ObjectMapper mapper;

    public MongoOperatorProtectionAdvice(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public boolean supports(
            MethodParameter parameter,
            Type targetType,
            Class<? extends HttpMessageConverter<?>> converterType) {

        return true;
    }

    @Override
    public HttpInputMessage beforeBodyRead(
            HttpInputMessage inputMessage,
            MethodParameter parameter,
            Type targetType,
            Class<? extends HttpMessageConverter<?>> converterType)
            throws IOException {

        if (inputMessage.getHeaders().getContentType() == null
                || !inputMessage.getHeaders()
                .getContentType()
                .toString()
                .contains("json")) {

            return inputMessage;
        }

        JsonNode root = mapper.readTree(inputMessage.getBody());

        // Reject MongoDB operator/injection-style field names.
        rejectMongoOperators(root);

        /*
         * Do NOT sanitize string values here.
         *
         * Passwords, tokens, and other sensitive values must remain
         * exactly as the client submitted them. HTML sanitization here
         * can transform characters such as '>' into HTML entities and
         * break password matching.
         */
        byte[] body = mapper.writeValueAsBytes(root);

        return new HttpInputMessage() {

            @Override
            public org.springframework.http.HttpHeaders getHeaders() {
                return inputMessage.getHeaders();
            }

            @Override
            public java.io.InputStream getBody() {
                return new ByteArrayInputStream(body);
            }
        };
    }

    @Override
    public Object afterBodyRead(
            Object body,
            HttpInputMessage inputMessage,
            MethodParameter parameter,
            Type targetType,
            Class<? extends HttpMessageConverter<?>> converterType) {

        return body;
    }

    @Override
    public Object handleEmptyBody(
            Object body,
            HttpInputMessage inputMessage,
            MethodParameter parameter,
            Type targetType,
            Class<? extends HttpMessageConverter<?>> converterType) {

        return body;
    }

    /**
     * Recursively reject MongoDB operator field names such as:
     * <ul>
     *   <li>{@code "$ne"}, {@code "$gt"}, {@code "$where"}</li>
     *   <li>{@code "user.password"} (dotted path injection)</li>
     * </ul>
     */
    private void rejectMongoOperators(JsonNode node) {

        if (node == null) {
            return;
        }

        if (node.isObject()) {

            Iterator<Map.Entry<String, JsonNode>> fields = node.properties().iterator();

            while (fields.hasNext()) {

                Map.Entry<String, JsonNode> field = fields.next();

                String fieldName = field.getKey();

                if (fieldName.startsWith("$") || fieldName.contains(".")) {
                    throw new BadRequestException("Invalid request field");
                }

                rejectMongoOperators(field.getValue());
            }

        } else if (node.isArray()) {

            for (JsonNode item : node) {
                rejectMongoOperators(item);
            }
        }
    }
}