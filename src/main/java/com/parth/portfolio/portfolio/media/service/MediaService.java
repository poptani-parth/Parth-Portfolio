package com.parth.portfolio.portfolio.media.service;

import com.parth.portfolio.portfolio.media.entity.Media;
import com.parth.portfolio.portfolio.media.dto.MediaResponse;
import com.parth.portfolio.portfolio.media.repository.MediaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;

    public MediaService(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    public List<MediaResponse> getPublicMedia() {

        return mediaRepository
            .findByActiveTrueOrderByCreatedAtDesc()
                .stream()
            .map(this::toResponse)
                .toList();
    }

    public List<MediaResponse> getPublicMediaByUsage(
            String usage
    ) {

        return mediaRepository
                .findByActiveTrueAndUsageOrderByCreatedAtDesc(
                        usage
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public MediaResponse getById(String id) {

        Media media = mediaRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Media not found: " + id
                        )
                );

        return toResponse(media);
    }

    private MediaResponse toResponse(Media media) {

        return new MediaResponse(
            media.getId(),
            media.getName(),
            media.getOriginalFileName(),
            media.getUrl(),
            media.getType(),
            media.getMimeType(),
            media.getSize(),
            media.getAltText(),
            media.getCaption(),
            media.getUsage(),
            media.isActive(),
            media.getCreatedAt()
        );
    }
}