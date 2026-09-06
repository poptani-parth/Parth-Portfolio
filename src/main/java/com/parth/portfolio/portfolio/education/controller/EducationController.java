package com.parth.portfolio.portfolio.education.controller;

import com.parth.portfolio.portfolio.education.dto.EducationResponse;
import com.parth.portfolio.portfolio.education.service.EducationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/education")
@Tag(
        name = "Public Education",
        description = "Public read-only education APIs"
)
public class EducationController {

    private final EducationService educationService;

    public EducationController(EducationService educationService) {
        this.educationService = educationService;
    }

    @GetMapping
    @Operation(
            summary = "Get education",
            description = "Returns active education entries ordered by display order"
    )
    public ResponseEntity<List<EducationResponse>> getEducation() {

        return ResponseEntity.ok(
                educationService.getPublicEducation()
        );
    }
}