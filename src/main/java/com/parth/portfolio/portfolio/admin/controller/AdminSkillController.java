package com.parth.portfolio.portfolio.admin.controller;

import com.parth.portfolio.portfolio.admin.dto.AdminSkillResponse;
import com.parth.portfolio.portfolio.admin.dto.ReorderItemRequest;
import com.parth.portfolio.portfolio.admin.dto.SkillRequest;
import com.parth.portfolio.portfolio.admin.service.AdminSkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/skills")
@Tag(name = "Admin Skills", description = "Admin CRUD APIs for skills")@PreAuthorize("hasRole('ADMIN')")
public class AdminSkillController {
    private final AdminSkillService skillService;

    public AdminSkillController(AdminSkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    @Operation(summary = "Get all skills")
    public ResponseEntity<List<AdminSkillResponse>> getAll() {
        return ResponseEntity.ok(skillService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill by ID")
    public ResponseEntity<AdminSkillResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(skillService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create skill")
    public ResponseEntity<AdminSkillResponse> create(@Valid @RequestBody SkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(skillService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update skill")
    public ResponseEntity<AdminSkillResponse> update(@PathVariable String id,
            @Valid @RequestBody SkillRequest request) {
        return ResponseEntity.ok(skillService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete skill")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        skillService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reorder")
    @Operation(summary = "Reorder skills", description = "Updates skill order values for drag-and-drop sorting")

    public ResponseEntity<Void> reorder(
            @Valid @RequestBody List<ReorderItemRequest> items) {

        skillService.reorder(items);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk")
    @Operation(summary = "Create multiple skills", description = "Bulk insert skills into a category")
    public ResponseEntity<List<AdminSkillResponse>> createBulkSkills(@Valid @RequestBody List<SkillRequest> requests) {
        List<AdminSkillResponse> createdSkills = skillService.createBulk(requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSkills);
    }

}