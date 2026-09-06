package com.parth.portfolio.portfolio.admin.service;

import com.parth.portfolio.portfolio.media.dto.MediaResponse;
import com.parth.portfolio.portfolio.media.entity.Media;
import com.parth.portfolio.portfolio.media.repository.MediaRepository;
import com.parth.portfolio.portfolio.media.service.LocalFileStorageService;
import com.parth.portfolio.portfolio.media.service.LocalFileStorageService.StoredFile;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.owasp.html.HtmlPolicyBuilder;

import java.io.IOException;
import java.util.List;

@Service
public class AdminMediaService {

    private static final org.owasp.html.PolicyFactory PLAIN_TEXT = new HtmlPolicyBuilder().toFactory();

    private final MediaRepository mediaRepository;
    private final LocalFileStorageService storageService;
    private final String publicBaseUrl;

    public AdminMediaService(
            MediaRepository mediaRepository,
            LocalFileStorageService storageService,
            @Value("${app.storage.public-base-url:/uploads}")
            String publicBaseUrl
    ) {
        this.mediaRepository = mediaRepository;
        this.storageService = storageService;
        this.publicBaseUrl = publicBaseUrl;
    }

    public MediaResponse upload(
            MultipartFile file,
            String usage,
            String altText,
            String caption
    ) throws IOException {

        StoredFile stored = storageService.store(file);

        Media media =
                Media.builder()
                        .name(stored.originalFileName())
                        .originalFileName(stored.originalFileName())
                        .url(
                                publicBaseUrl
                                        + "/"
                                        + stored.storedFileName()
                        )
                        .type(stored.type())
                        .mimeType(stored.mimeType())
                        .size(stored.size())
                        .altText(clean(altText))
                        .caption(clean(caption))
                        .usage(clean(usage))
                        .storagePath(stored.path().toString())
                        .storageFileName(stored.storedFileName())
                        .active(true)
                        .build();

        return toResponse(
                mediaRepository.save(media)
        );
    }

    public List<MediaResponse> getAll() {

        return mediaRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void delete(
            String id
    ) throws IOException {

        Media media =
                mediaRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Media not found: " + id
                                )
                        );

        storageService.delete(
                media.getStorageFileName()
        );

        mediaRepository.delete(media);
    }

    private MediaResponse toResponse(
            Media media
    ) {

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

    private String clean(String value) {
        return value == null ? null : PLAIN_TEXT.sanitize(value);
    }
}