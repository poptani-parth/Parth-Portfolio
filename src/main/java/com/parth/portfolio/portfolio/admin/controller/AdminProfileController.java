package com.parth.portfolio.portfolio.admin.controller;

import com.parth.portfolio.portfolio.admin.dto.AdminProfileResponse;
import com.parth.portfolio.portfolio.admin.dto.ProfileRequest;
import com.parth.portfolio.portfolio.admin.service.AdminProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/profile")
@Tag(name = "Admin Profile", description = "Admin APIs for managing site profile")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProfileController {
    private final AdminProfileService profileService;

    public AdminProfileController(AdminProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @Operation(summary = "Get profile for admin")
    public ResponseEntity<AdminProfileResponse> getProfile() {
        return ResponseEntity.ok(profileService.getProfile());
    }

    @PostMapping
    @Operation(summary = "Create profile")
    public ResponseEntity<AdminProfileResponse> create(@Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.create(request));
    }

    @PutMapping
    @Operation(summary = "Update profile")
    public ResponseEntity<AdminProfileResponse> update(@Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(profileService.update(request));
    }
}