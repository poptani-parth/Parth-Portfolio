package com.parth.portfolio.portfolio.admin.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin_users")
public class AdminUser {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @JsonIgnore
    @ToString.Exclude
    private String password;

    @Builder.Default
    private String role = "ADMIN";

    @Builder.Default
    private boolean active = true;

    /** A SHA-256 digest of the one-time reset token, never the token itself. */
    @JsonIgnore
    @ToString.Exclude
    private String passwordResetTokenHash;

    private Instant passwordResetExpiresAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
