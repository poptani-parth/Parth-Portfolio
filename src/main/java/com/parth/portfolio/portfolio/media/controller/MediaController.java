package com.parth.portfolio.portfolio.media.controller;

import com.parth.portfolio.portfolio.media.dto.MediaResponse;
import com.parth.portfolio.portfolio.media.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.Size;

import java.util.List;

@RestController
@RequestMapping("/api/media")
@Validated
@Tag(
        name = "Public Media",
        description = "Public read-only media APIs"
)
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @Operation(
            summary = "Get public media",
            description = "Returns active media assets ordered by display order"
    )
    public ResponseEntity<List<MediaResponse>> getMedia(
            @Parameter(
                    description = "Optional usage filter such as PROFILE, PROJECT or CERTIFICATE"
            )
            @RequestParam(required = false) @Size(max = 50) String usage
    ) {

        if (usage == null || usage.isBlank()) {
            return ResponseEntity.ok(
                    mediaService.getPublicMedia()
            );
        }

        return ResponseEntity.ok(
                mediaService.getPublicMediaByUsage(
                        usage
                )
        );
    }
}
