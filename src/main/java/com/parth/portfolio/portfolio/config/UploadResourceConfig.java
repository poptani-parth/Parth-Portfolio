package com.parth.portfolio.portfolio.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class UploadResourceConfig
        implements WebMvcConfigurer {

    private final String uploadDirectory;

    public UploadResourceConfig(
            @Value("${app.storage.local-dir:./uploads}")
            String uploadDirectory
    ) {
        this.uploadDirectory = uploadDirectory;
    }

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        String location =
                "file:"
                        + uploadDirectory
                        + "/";

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
