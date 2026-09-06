package com.parth.portfolio.portfolio.profile.controller;

import com.parth.portfolio.portfolio.profile.dto.ProfileResponse;
import com.parth.portfolio.portfolio.profile.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@Tag(
        name = "Public Profile",
        description = "Public read-only profile API"
)
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(
            ProfileService profileService) {

        this.profileService = profileService;
    }

    @GetMapping
    @Operation(
            summary = "Get profile",
            description = "Returns the public portfolio profile"
    )
    public ResponseEntity<ProfileResponse> getProfile() {

        return ResponseEntity.ok(
                profileService.getPublicProfile()
        );
    }
}
