package com.parth.portfolio.portfolio.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parth.portfolio.portfolio.admin.entity.AuditLog;
import com.parth.portfolio.portfolio.admin.repository.AuditLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Captures field names (never request values) for admin-operation audit trails.
 *
 * <h3>Reliability tradeoff (issue 17)</h3>
 * <p>Audit persistence failures are caught and logged rather than propagated.
 * This is a deliberate tradeoff: an audit write failure must NOT convert a
 * successful admin operation into HTTP 500. For this single-admin portfolio CMS
 * the accepted risk is that a DB outage could produce a gap in the audit trail.
 * A production multi-admin CMS should replace this with an async audit event
 * queue (e.g. Kafka/SQS) with durable storage and alerting on missed writes.</p>
 *
 * <h3>Client IP accuracy (issue 18)</h3>
 * <p>{@code request.getRemoteAddr()} is used intentionally.
 * {@code server.forward-headers-strategy: framework} in application.yml tells
 * Spring to process {@code X-Forwarded-For} / {@code Forwarded} headers before
 * any filter runs, so {@code getRemoteAddr()} already returns the framework-
 * normalized real client address even when deployed behind a reverse proxy.
 * No manual header parsing is needed or safe here.</p>
 */
@Component
public class AuditLoggingFilter extends OncePerRequestFilter {
    private final AuditLogRepository auditLogs;
    private final ObjectMapper mapper;

    public AuditLoggingFilter(AuditLogRepository auditLogs, ObjectMapper mapper) {
        this.auditLogs = auditLogs;
        this.mapper = mapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/admin/") || HttpMethod.GET.matches(request.getMethod())
                || request.getRequestURI().startsWith("/api/admin/auth/login")
                || request.getRequestURI().startsWith("/api/admin/auth/refresh")
                || request.getRequestURI().startsWith("/api/admin/auth/password-reset");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        ContentCachingRequestWrapper wrapped = new ContentCachingRequestWrapper(request, 32 * 1024);
        chain.doFilter(wrapped, response);
        if (response.getStatus() >= 200 && response.getStatus() < 400) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            try {
                auditLogs.save(
                        AuditLog.builder().actor(auth == null ? "anonymous" : auth.getName()).action(request.getMethod())
                                .resource(request.getRequestURI()).changedFields(changedFields(wrapped))
                                // getRemoteAddr() is the framework-normalized client IP; see class Javadoc.
                                .clientIp(request.getRemoteAddr())
                                .responseStatus(response.getStatus()).build());
            } catch (Exception ex) {
                // Deliberate swallow: audit persistence must not convert a successful
                // admin operation into HTTP 500. See class Javadoc for the full rationale.
                // Never log request bodies, credentials, tokens, or cookies here.
                org.slf4j.LoggerFactory.getLogger(AuditLoggingFilter.class)
                        .error("Audit logging failed for {} {}", request.getMethod(), request.getRequestURI(), ex);
            }
        }
    }

    private List<String> changedFields(ContentCachingRequestWrapper request) {
        if (request.getContentAsByteArray().length == 0 || request.getContentType() == null
                || !request.getContentType().contains("json"))
            return List.of();
        try {
            JsonNode root = mapper.readTree(new String(request.getContentAsByteArray(), StandardCharsets.UTF_8));
            List<String> names = new ArrayList<>();
            collect(root, "", names);
            return names;
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private void collect(JsonNode node, String prefix, List<String> names) {
        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.properties().iterator();

            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String name = prefix + entry.getKey();

                names.add(name);
                collect(entry.getValue(), name + ".", names);
            }
        }
    }
}
