package com.parth.portfolio.portfolio.contact.controller;

import com.parth.portfolio.portfolio.contact.dto.ContactRequest;
import com.parth.portfolio.portfolio.contact.dto.ContactResponse;
import com.parth.portfolio.portfolio.contact.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@Tag(
        name = "Contact",
        description = "Public contact form API"
)
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    @Operation(
            summary = "Submit contact form",
            description = "Validates and sends a contact message to the portfolio owner"
    )
    public ResponseEntity<ContactResponse> submit(
            @Valid @RequestBody ContactRequest request,
            HttpServletRequest httpRequest) {

        /*
         * Do not manually trust X-Forwarded-For.
         *
         * Using getRemoteAddr() prevents a normal client from
         * supplying a fake X-Forwarded-For header to manipulate
         * the rate-limiter identity.
         *
         * If the application is deployed behind a reverse proxy,
         * the proxy must be configured as a trusted boundary.
         */
        String clientIp = httpRequest.getRemoteAddr();

        ContactResponse response =
                contactService.submit(request, clientIp);

        return ResponseEntity.ok(response);
    }
}
