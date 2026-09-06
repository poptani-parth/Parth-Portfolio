package com.parth.portfolio.portfolio.admin.controller;

import com.parth.portfolio.portfolio.admin.dto.AdminProjectResponse;
import com.parth.portfolio.portfolio.admin.dto.ProjectRequest;
import com.parth.portfolio.portfolio.admin.service.AdminProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/projects")
@Tag(
        name = "Admin Projects",
        description = "Admin CRUD APIs for projects"
)
@PreAuthorize("hasRole('ADMIN')")
public class AdminProjectController {

    private final AdminProjectService projectService;

    public AdminProjectController(
            AdminProjectService projectService) {

        this.projectService = projectService;
    }

    @GetMapping
    @Operation(
            summary = "Get all projects"
    )
    public ResponseEntity<List<AdminProjectResponse>> getAll() {

        return ResponseEntity.ok(
                projectService.getAll()
        );
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get project by ID"
    )
    public ResponseEntity<AdminProjectResponse> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                projectService.getById(id)
        );
    }

    @PostMapping
    @Operation(
            summary = "Create project"
    )
    public ResponseEntity<AdminProjectResponse> create(
            @Valid @RequestBody ProjectRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        projectService.create(
                                request
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update project"
    )
    public ResponseEntity<AdminProjectResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ProjectRequest request) {

        return ResponseEntity.ok(
                projectService.update(
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete project"
    )
    public ResponseEntity<Void> delete(
            @PathVariable String id) {

        projectService.delete(id);

        return ResponseEntity.noContent().build();
    }
}