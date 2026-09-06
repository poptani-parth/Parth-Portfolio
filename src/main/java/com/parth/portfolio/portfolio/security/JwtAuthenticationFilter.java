package com.parth.portfolio.portfolio.security;

import com.parth.portfolio.portfolio.admin.entity.AdminUser;
import com.parth.portfolio.portfolio.admin.repository.AdminUserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AdminUserRepository adminUserRepository;
    private final String accessCookieName;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            AdminUserRepository adminUserRepository,
            @Value("${app.security.auth.cookies.access-name:admin-access}")
            String accessCookieName
    ) {
        this.jwtService = jwtService;
        this.adminUserRepository = adminUserRepository;
        this.accessCookieName = accessCookieName;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        /*
         * Authentication is now carried by the HttpOnly access cookie.
         *
         * Do not read the JWT from the Authorization header.
         */
        String token = getAccessToken(request);

        if (token != null
                && !token.isBlank()
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            try {
                Claims claims = jwtService.parse(token);

                if (jwtService.isAccessToken(claims)) {

                    String userId =
                            claims.get("uid", String.class);

                    String subject =
                            claims.getSubject();

                    String jti =
                            claims.getId();

                    if (userId != null && !userId.isBlank()
                            && subject != null && !subject.isBlank()
                            && jti != null && !jti.isBlank()
                            && claims.getIssuedAt() != null
                            && claims.getExpiration() != null) {

                        Optional<AdminUser> adminUser =
                                adminUserRepository.findById(userId);

                        /*
                         * Always verify current database state.
                         *
                         * A valid JWT must not keep a disabled/deleted
                         * admin authenticated.
                         */
                        if (adminUser.isPresent()) {

                            AdminUser user =
                                    adminUser.get();

                            if (user.isActive()
                                    && subject.equals(user.getUsername())) {

                                authenticate(user);
                            }
                        }
                    }
                }

            } catch (JwtException | IllegalArgumentException ignored) {
                /*
                 * Do not expose JWT parsing details.
                 * Protected endpoints will be handled as unauthenticated.
                 */
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Read the configured access JWT from the request cookies.
     */
    private String getAccessToken(
            HttpServletRequest request
    ) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {

            if (accessCookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }

    private void authenticate(AdminUser user) {

        String role = user.getRole();

        if (role == null || role.isBlank()) {
            return;
        }

        String authority =
                role.startsWith("ROLE_")
                        ? role
                        : "ROLE_" + role;

        List<SimpleGrantedAuthority> authorities =
                List.of(
                        new SimpleGrantedAuthority(authority)
                );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        null,
                        authorities
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }
}