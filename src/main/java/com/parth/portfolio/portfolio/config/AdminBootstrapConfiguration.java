package com.parth.portfolio.portfolio.config;

import com.parth.portfolio.portfolio.admin.entity.AdminUser;
import com.parth.portfolio.portfolio.admin.repository.AdminUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;

@Configuration
public class AdminBootstrapConfiguration {

    private static final Logger log =
            LoggerFactory.getLogger(AdminBootstrapConfiguration.class);

    @Bean
    ApplicationRunner seedInitialAdmin(
            AdminUserRepository users,
            @Value("${app.security.admin.username:admin}") String username,
            @Value("${app.security.admin.password-hash:}") String passwordHash,
            @Value("${app.security.admin.bootstrap-enabled:false}") boolean bootstrapEnabled) {

        return args -> {

            /*
             * Bootstrap is disabled by default.
             *
             * In production, keep:
             *
             * ADMIN_BOOTSTRAP_ENABLED=false
             *
             * This prevents application restarts from modifying
             * existing administrator accounts.
             */
            if (!bootstrapEnabled) {
                return;
            }

            /*
             * Required configuration must be present when
             * bootstrap is explicitly enabled.
             */
            if (username.isBlank() || passwordHash.isBlank()) {
                log.warn(
                        "Admin bootstrap is enabled but admin username/password hash "
                                + "is not configured; skipping bootstrap."
                );
                return;
            }

            /*
             * Validate that the configured password is a BCrypt hash.
             *
             * BCrypt hashes are exactly 60 characters and normally
             * start with $2a$, $2b$, or $2y$.
             */
            if (!passwordHash.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$")) {
                throw new IllegalStateException(
                        "ADMIN_PASSWORD_HASH must be a valid 60-character BCrypt hash"
                );
            }

            /*
             * CRITICAL SECURITY RULE:
             *
             * Never modify an existing administrator here.
             *
             * This prevents an application restart from resetting
             * a password that was changed through the application.
             */
            if (users.findByUsername(username).isPresent()) {
                log.info(
                        "Admin bootstrap skipped; user [{}] already exists.",
                        username
                );
                return;
            }

            /*
             * Create the initial administrator only when the account
             * does not already exist.
             */
            AdminUser admin = new AdminUser();

            admin.setUsername(username);
            admin.setPassword(passwordHash);
            admin.setRole("ADMIN");
            admin.setActive(true);
            admin.setCreatedAt(Instant.now());

            users.save(admin);

            log.info(
                    "Initial admin user [{}] created successfully.",
                    username
            );
        };
    }
}