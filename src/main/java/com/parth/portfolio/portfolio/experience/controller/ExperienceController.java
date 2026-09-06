package com.parth.portfolio.portfolio.experience.controller;

import com.parth.portfolio.portfolio.experience.dto.ExperienceResponse;
import com.parth.portfolio.portfolio.experience.service.ExperienceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/experience")
@Tag(
        name = "Public Experience",
        description = "Public read-only work experience APIs"
)
public class ExperienceController {

    private final ExperienceService experienceService;

    public ExperienceController(
            ExperienceService experienceService) {

        this.experienceService = experienceService;
    }

    @GetMapping
    @Operation(
            summary = "Get work experience",
            description = "Returns active work experience ordered by most recent first"
    )
    public ResponseEntity<List<ExperienceResponse>> getExperience() {

        return ResponseEntity.ok(
                experienceService.getPublicExperience()
        );
    }
}