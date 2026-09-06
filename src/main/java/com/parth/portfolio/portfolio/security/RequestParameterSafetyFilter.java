package com.parth.portfolio.portfolio.security;

import com.parth.portfolio.common.exception.BadRequestException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/** Covers query/form input; JSON bodies are checked and sanitized by RequestSanitizationAdvice. */
@Component
public class RequestParameterSafetyFilter extends OncePerRequestFilter {
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
            if (entry.getKey().startsWith("$") || entry.getKey().contains(".")) throw new BadRequestException("Invalid request parameter");
            for (String value : entry.getValue()) if (value != null && value.matches("(?is).*\\$(where|ne|gt|gte|lt|lte|regex|expr|jsonSchema)\\b.*"))
                throw new BadRequestException("Invalid request parameter");
        }
        chain.doFilter(request, response);
    }
}
