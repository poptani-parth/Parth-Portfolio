package com.parth.portfolio.portfolio.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Parth Portfolio API",
                version = "1.0.0",
                description = "Public API for the portfolio website and contact form"
        )
)
public class OpenApiConfig {
}
