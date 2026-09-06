package com.parth.portfolio.portfolio.admin.controller;

import com.parth.portfolio.portfolio.admin.dto.ContactMessageResponse;
import com.parth.portfolio.portfolio.admin.dto.ContactStatusResponse;
import com.parth.portfolio.portfolio.admin.service.AdminContactService;
import com.parth.portfolio.common.enums.ContactMessageStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/contact")
@PreAuthorize("hasRole('ADMIN')")
@Tag(
        name = "Admin Contact",
        description = "Admin contact message management"
)
public class AdminContactController {

    private final AdminContactService contactService;

    public AdminContactController(
            AdminContactService contactService
    ) {
        this.contactService = contactService;
    }

    @GetMapping
    @Operation(
            summary = "Get submitted contact messages"
    )
    public ResponseEntity<List<ContactMessageResponse>> getAll(
            @RequestParam(required = false)
            ContactMessageStatus status
    ) {

        return ResponseEntity.ok(
                contactService.getAll(status)
        );
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get contact message"
    )
    public ResponseEntity<ContactMessageResponse> getById(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                contactService.getById(id)
        );
    }

    @PatchMapping("/{id}/read")
    @Operation(
            summary = "Mark contact message as read"
    )
    public ResponseEntity<ContactStatusResponse> markAsRead(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                contactService.markAsRead(id)
        );
    }

    @PatchMapping("/{id}/archive")
    @Operation(
            summary = "Archive contact message"
    )
    public ResponseEntity<ContactStatusResponse> archive(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                contactService.archive(id)
        );
    }
}
