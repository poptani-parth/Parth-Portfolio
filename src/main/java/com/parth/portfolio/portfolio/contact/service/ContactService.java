package com.parth.portfolio.portfolio.contact.service;

import com.parth.portfolio.portfolio.contact.dto.ContactRequest;
import com.parth.portfolio.portfolio.contact.dto.ContactResponse;
import com.parth.portfolio.portfolio.contact.entity.ContactMessage;
import com.parth.portfolio.common.enums.ContactMessageStatus;
import com.parth.portfolio.portfolio.contact.exception.ContactRateLimitExceededException;
import com.parth.portfolio.portfolio.contact.rate.ContactRateLimitService;
import com.parth.portfolio.portfolio.contact.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    private final ContactMailService contactMailService;
    private final ContactRateLimitService rateLimitService;
    private final ContactMessageRepository contactMessageRepository;

    public ContactService(
            ContactMailService contactMailService,
            ContactRateLimitService rateLimitService,
            ContactMessageRepository contactMessageRepository
    ) {
        this.contactMailService = contactMailService;
        this.rateLimitService = rateLimitService;
        this.contactMessageRepository =
                contactMessageRepository;
    }

    public ContactResponse submit(
            ContactRequest request,
            String clientIp
    ) {

        if (!rateLimitService.isAllowed(clientIp)) {

            throw new ContactRateLimitExceededException(
                    "Too many contact requests. Please try again later."
            );
        }

        ContactMessage message =
                ContactMessage.builder()
                        .name(request.name())
                        .email(request.email())
                        .subject(request.subject())
                        .message(request.message())
                        .status(
                                ContactMessageStatus.UNREAD
                        )
                        .build();

        contactMessageRepository.save(message);

        contactMailService.sendContactNotification(
                request
        );

        return new ContactResponse(
                "Your message has been sent successfully."
        );
    }
}
