package com.parth.portfolio.portfolio.project.controller;

import com.parth.portfolio.portfolio.project.dto.ProjectResponse;
import com.parth.portfolio.portfolio.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@Tag(
        name = "Public Projects",
        description = "Public read-only project APIs"
)
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(
            ProjectService projectService) {

        this.projectService = projectService;
    }

    @GetMapping
    @Operation(
            summary = "Get projects",
            description = "Returns active projects with optional category and technology filters"
    )
    public ResponseEntity<List<ProjectResponse>> getProjects(

            @Parameter(
                    description = "Filter by project category"
            )
            @RequestParam(required = false)
            String category,

            @Parameter(
                    description = "Filter by technology tag"
            )
            @RequestParam(required = false)
            String tech
    ) {

        return ResponseEntity.ok(
                projectService.getPublicProjects(
                        category,
                        tech
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get project by ID"
    )
    public ResponseEntity<ProjectResponse> getById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                projectService.getById(id)
        );
    }
}