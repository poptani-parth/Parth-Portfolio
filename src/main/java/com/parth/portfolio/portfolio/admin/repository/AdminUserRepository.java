package com.parth.portfolio.portfolio.admin.repository;

import com.parth.portfolio.portfolio.admin.entity.AdminUser;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AdminUserRepository
        extends MongoRepository<AdminUser, String> {

    Optional<AdminUser> findByUsername(String username);

    boolean existsByUsername(String username);
}