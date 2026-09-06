package com.parth.portfolio.portfolio.admin.service;

import com.parth.portfolio.portfolio.admin.dto.ContactMessageResponse;
import com.parth.portfolio.portfolio.admin.dto.ContactStatusResponse;
import com.parth.portfolio.portfolio.contact.entity.ContactMessage;
import com.parth.portfolio.common.enums.ContactMessageStatus;
import com.parth.portfolio.portfolio.contact.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class AdminContactService {

    private final ContactMessageRepository repository;

    public AdminContactService(
            ContactMessageRepository repository
    ) {
        this.repository = repository;
    }

    public List<ContactMessageResponse> getAll(
            ContactMessageStatus status
    ) {

        List<ContactMessage> messages;

        if (status == null) {

            messages =
                    repository.findAllByOrderByCreatedAtDesc();

        } else {

            messages =
                    repository.findByStatusOrderByCreatedAtDesc(
                            status
                    );
        }

        return messages.stream()
                .map(this::toResponse)
                .toList();
    }

    public ContactMessageResponse getById(
            String id
    ) {

        return toResponse(
                findMessage(id)
        );
    }

    public ContactStatusResponse markAsRead(
            String id
    ) {

        ContactMessage message =
                findMessage(id);

        message.setStatus(
                ContactMessageStatus.READ
        );

        message.setReadAt(
                Instant.now()
        );

        return new ContactStatusResponse(
                repository.save(message).getId(),
                ContactMessageStatus.READ
        );
    }

    public ContactStatusResponse archive(
            String id
    ) {

        ContactMessage message =
                findMessage(id);

        message.setStatus(
                ContactMessageStatus.ARCHIVED
        );

        message.setArchivedAt(
                Instant.now()
        );

        return new ContactStatusResponse(
                repository.save(message).getId(),
                ContactMessageStatus.ARCHIVED
        );
    }

    private ContactMessage findMessage(
            String id
    ) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Contact message not found: " + id
                        )
                );
    }

    private ContactMessageResponse toResponse(
            ContactMessage message
    ) {

        return new ContactMessageResponse(
                message.getId(),
                message.getName(),
                message.getEmail(),
                message.getSubject(),
                message.getMessage(),
                message.getStatus(),
                message.getReadAt(),
                message.getArchivedAt(),
                message.getCreatedAt()
        );
    }
}

