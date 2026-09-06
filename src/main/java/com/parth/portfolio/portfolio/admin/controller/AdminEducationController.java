package com.parth.portfolio.portfolio.admin.controller;

import com.parth.portfolio.portfolio.admin.dto.AdminEducationResponse;
import com.parth.portfolio.portfolio.admin.dto.EducationRequest;
import com.parth.portfolio.portfolio.admin.service.AdminEducationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/education")
@Tag(
        name = "Admin Education",
        description = "Admin CRUD APIs for education"
)
@PreAuthorize("hasRole('ADMIN')")
public class AdminEducationController {

    private final AdminEducationService educationService;

    public AdminEducationController(
            AdminEducationService educationService) {
        this.educationService = educationService;
    }

    @GetMapping
    @Operation(summary = "Get all education entries")
    public ResponseEntity<List<AdminEducationResponse>> getAll() {

        return ResponseEntity.ok(
                educationService.getAll()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get education by ID")
    public ResponseEntity<AdminEducationResponse> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                educationService.getById(id)
        );
    }

    @PostMapping
    @Operation(summary = "Create education")
    public ResponseEntity<AdminEducationResponse> create(
            @Valid @RequestBody EducationRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(educationService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update education")
    public ResponseEntity<AdminEducationResponse> update(
            @PathVariable String id,
            @Valid @RequestBody EducationRequest request) {

        return ResponseEntity.ok(
                educationService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete education")
    public ResponseEntity<Void> delete(
            @PathVariable String id) {

        educationService.delete(id);

        return ResponseEntity.noContent().build();
    }
}