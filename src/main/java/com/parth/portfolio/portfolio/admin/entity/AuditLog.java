package com.parth.portfolio.portfolio.admin.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admin_audit_log")
public class AuditLog {
    @Id private String id;
    @Indexed private String actor;
    private String action;
    private String resource;
    private List<String> changedFields;
    private String clientIp;
    private int responseStatus;
    @CreatedDate @Indexed private Instant createdAt;
}
