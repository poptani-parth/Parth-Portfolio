package com.parth.portfolio.portfolio.skill.controller;

import com.parth.portfolio.portfolio.skill.dto.SkillGroupResponse;
import com.parth.portfolio.portfolio.skill.dto.SkillResponse;
import com.parth.portfolio.portfolio.skill.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/skills")
@Tag(name = "Public Skills", description = "Public read-only skill APIs")
public class SkillController {
    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    @Operation(summary = "Get skills", description = "Returns active skills grouped by category and ordered by display order")
    public ResponseEntity<List<SkillGroupResponse>> getSkills(
            @Parameter(description = "Optional category filter") @RequestParam(required = false) String category) {
        if (category == null || category.isBlank()) {
            return ResponseEntity.ok(skillService.getPublicSkills());
        }
        return ResponseEntity.ok(skillService.getPublicSkillsByCategory(category));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill by ID")
    public ResponseEntity<SkillResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(skillService.getById(id));
    }
}