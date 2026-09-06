package com.parth.portfolio.portfolio.admin.controller;

import com.parth.portfolio.portfolio.admin.dto.AdminSkillCategoryResponse;
import com.parth.portfolio.portfolio.admin.dto.SkillCategoryRequest;
import com.parth.portfolio.portfolio.admin.service.AdminSkillCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/skill-categories")
@Tag(name = "Admin Skill Categories", description = "Admin CRUD APIs for skill categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSkillCategoryController {

    private final AdminSkillCategoryService categoryService;

    public AdminSkillCategoryController(AdminSkillCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Get all skill categories")
    public ResponseEntity<List<AdminSkillCategoryResponse>> getAll() {
        return ResponseEntity.ok(categoryService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill category by ID")
    public ResponseEntity<AdminSkillCategoryResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create skill category")
    public ResponseEntity<AdminSkillCategoryResponse> create(@Valid @RequestBody SkillCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update skill category")
    public ResponseEntity<AdminSkillCategoryResponse> update(@PathVariable String id,
            @Valid @RequestBody SkillCategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete skill category")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
