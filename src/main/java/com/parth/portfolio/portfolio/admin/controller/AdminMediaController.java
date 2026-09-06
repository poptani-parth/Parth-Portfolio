package com.parth.portfolio.portfolio.admin.controller;

import com.parth.portfolio.portfolio.media.dto.MediaResponse;
import com.parth.portfolio.portfolio.admin.service.AdminMediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import org.springframework.validation.annotation.Validated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/media")
@PreAuthorize("hasRole('ADMIN')")
@Validated
@Tag(
        name = "Admin Media",
        description = "Admin media management and file upload"
)
public class AdminMediaController {

    private final AdminMediaService mediaService;

    public AdminMediaController(
            AdminMediaService mediaService
    ) {
        this.mediaService = mediaService;
    }

    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )
    @Operation(
            summary = "Upload portfolio file",
            description = "Uploads profile image, project image or resume PDF"
    )
    public ResponseEntity<MediaResponse> upload(
            @Parameter(description = "Image or PDF file")
            @RequestParam("file")
            MultipartFile file,

            @RequestParam
            @Pattern(regexp = "(?i)^(profile|project|resume|certificate|general)$", message = "Invalid media usage")
            @Size(max = 50)
            String usage,

            @RequestParam(required = false)
            @Size(max = 300)
            String altText,

            @RequestParam(required = false)
            @Size(max = 500)
            String caption
    ) throws IOException {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        mediaService.upload(
                                file,
                                usage,
                                altText,
                                caption
                        )
                );
    }

    @GetMapping
    @Operation(
            summary = "Get all media"
    )
    public ResponseEntity<List<MediaResponse>> getAll() {

        return ResponseEntity.ok(
                mediaService.getAll()
        );
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete media"
    )
    public ResponseEntity<Void> delete(
            @PathVariable String id
    ) throws IOException {

        mediaService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
