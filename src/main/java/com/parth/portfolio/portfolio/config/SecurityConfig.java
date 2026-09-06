package com.parth.portfolio.portfolio.config;

import com.parth.portfolio.portfolio.security.AuditLoggingFilter;
import com.parth.portfolio.portfolio.security.JwtAuthenticationFilter;
import com.parth.portfolio.portfolio.security.RequestParameterSafetyFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

/**
 * Core Spring Security configuration.
 *
 * <h3>Security Processing Pipeline</h3>
 * The backend enforces defense-in-depth across clearly delineated, non-overlapping stages:
 * <ol>
 *   <li><b>Transport &amp; HTTP Security:</b> TLS enforcement (optional force-https), HSTS, CSP,
 *       CORS, Stateless session management, and SPA-compatible CSRF protection.</li>
 *   <li><b>RequestParameterSafetyFilter:</b> Servlet filter rejecting MongoDB operator/path injection
 *       ({@code $} or {@code .}) in query strings and form parameters prior to handler invocation.</li>
 *   <li><b>JwtAuthenticationFilter:</b> Validates access tokens and populates the {@link org.springframework.security.core.context.SecurityContext}.</li>
 *   <li><b>Authorization (RBAC):</b> URL-based matcher rules separating public endpoints from {@code /api/admin/**} (requires {@code ROLE_ADMIN}).</li>
 *   <li><b>AuditLoggingFilter:</b> Captures field names (never sensitive values) for successful admin mutations.</li>
 *   <li><b>MongoOperatorProtectionAdvice:</b> {@link org.springframework.web.bind.annotation.ControllerAdvice}
 *       inspecting parsed JSON request bodies for Mongo query operators.</li>
 *   <li><b>DTO Validation:</b> Jakarta Validation ({@code @Valid}, {@code @NotBlank}, {@code @ValidUrl}, etc.)
 *       enforcing field constraints.</li>
 *   <li><b>Business Layer:</b> Service layer validations and MongoDB/Redis persistence.</li>
 * </ol>
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtFilter,
            AuditLoggingFilter auditFilter,
            RequestParameterSafetyFilter parameterSafetyFilter,
            @Value("${app.security.force-https:false}") boolean forceHttps,
            @Value("${springdoc.swagger-ui.enabled:false}") boolean swaggerEnabled,
            org.springframework.core.env.Environment environment
    ) throws Exception {

        boolean isDevProfile = java.util.Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equals("local") || p.equals("dev") || p.equals("test"));

        http
                /*
                 * CSRF protection is enabled because the refresh token is stored
                 * in an HttpOnly cookie.
                 *
                 * Spring Security 7 SPA support:
                 * - creates XSRF-TOKEN cookie
                 * - expects X-XSRF-TOKEN header
                 */
                .csrf(csrf -> csrf.spa())

                .cors(Customizer.withDefaults())

                /*
                 * API remains stateless.
                 * Authentication is carried by the access JWT.
                 */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(
                                (request, response, error) ->
                                        response.sendError(HttpStatus.UNAUTHORIZED.value())
                        )
                        .accessDeniedHandler(
                                (request, response, error) ->
                                        response.sendError(HttpStatus.FORBIDDEN.value())
                        )
                )

                .headers(headers -> headers
                        .contentTypeOptions(Customizer.withDefaults())

                        .frameOptions(frame -> frame.deny())

                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .preload(true)
                                .maxAgeInSeconds(31536000)
                        )

                        .contentSecurityPolicy(csp ->
                                csp.policyDirectives(
                                        "default-src 'self'; " +
                                        "base-uri 'self'; " +
                                        "frame-ancestors 'none'; " +
                                        "object-src 'none'"
                                )
                        )

                        .referrerPolicy(referrer ->
                                referrer.policy(
                                        ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER
                                )
                        )
                )

                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(
                            "/api/contact",
                            "/api/profile",
                            "/api/skills",
                            "/api/skills/**",
                            "/api/experience",
                            "/api/education",
                            "/api/projects",
                            "/api/media",

                            // Authentication endpoints
                            "/api/admin/auth/csrf",
                            "/api/admin/auth/login",
                            "/api/admin/auth/refresh",
                            "/api/admin/auth/logout",
                            "/api/admin/auth/password-reset",
                            "/api/admin/auth/password-reset/confirm",

                            "/uploads/**"
                    ).permitAll();

                    // Swagger / OpenAPI documentation: only accessible in dev/local environments when enabled.
                    if (swaggerEnabled && isDevProfile) {
                        auth.requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs",
                                "/v3/api-docs/**"
                        ).permitAll();
                    }

                    auth.requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().denyAll();
                })

                .addFilterBefore(
                        parameterSafetyFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .addFilterAfter(
                        auditFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        if (forceHttps) {
            http.redirectToHttps(redirect -> {});
        }

        return http.build();
    }
}