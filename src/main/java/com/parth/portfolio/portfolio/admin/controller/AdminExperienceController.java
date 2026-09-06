package com.parth.portfolio.portfolio.admin.controller;

import com.parth.portfolio.portfolio.admin.dto.AdminExperienceResponse;
import com.parth.portfolio.portfolio.admin.dto.ExperienceRequest;
import com.parth.portfolio.portfolio.admin.service.AdminExperienceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/experience")
@Tag(
        name = "Admin Experience",
        description = "Admin CRUD APIs for work experience"
)
@PreAuthorize("hasRole('ADMIN')")
public class AdminExperienceController {

    private final AdminExperienceService experienceService;

    public AdminExperienceController(
            AdminExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @GetMapping
    @Operation(
            summary = "Get all experience",
            description = "Returns all experience entries for admin"
    )
    public ResponseEntity<List<AdminExperienceResponse>> getAll() {

        return ResponseEntity.ok(
                experienceService.getAll()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get experience by ID")
    public ResponseEntity<AdminExperienceResponse> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                experienceService.getById(id)
        );
    }

    @PostMapping
    @Operation(summary = "Create experience")
    public ResponseEntity<AdminExperienceResponse> create(
            @Valid @RequestBody ExperienceRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(experienceService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update experience")
    public ResponseEntity<AdminExperienceResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ExperienceRequest request) {

        return ResponseEntity.ok(
                experienceService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete experience")
    public ResponseEntity<Void> delete(
            @PathVariable String id) {

        experienceService.delete(id);

        return ResponseEntity.noContent().build();
    }
}