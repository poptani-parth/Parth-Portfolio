package com.parth.portfolio.portfolio.contact.repository;

import com.parth.portfolio.portfolio.contact.entity.ContactMessage;
import com.parth.portfolio.common.enums.ContactMessageStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ContactMessageRepository
        extends MongoRepository<ContactMessage, String> {

    List<ContactMessage>
    findAllByOrderByCreatedAtDesc();

    List<ContactMessage>
    findByStatusOrderByCreatedAtDesc(
            ContactMessageStatus status
    );
}