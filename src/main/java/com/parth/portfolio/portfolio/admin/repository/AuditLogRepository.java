package com.parth.portfolio.portfolio.admin.repository;

import com.parth.portfolio.portfolio.admin.entity.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuditLogRepository extends MongoRepository<AuditLog, String> { }
