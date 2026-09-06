package com.parth.portfolio.portfolio.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.List;

@Configuration
@EnableMongoRepositories(basePackages = "com.parth.portfolio")
public class MongoConfig {

    /**
     * Enables real MongoDB transactions for services using @Transactional.
     * Production MongoDB deployments must support transactions (for example,
     * Atlas replica sets). Standalone MongoDB cannot provide these guarantees.
     */
    @Bean
    MongoTransactionManager transactionManager(
            MongoDatabaseFactory mongoDatabaseFactory) {
        return new MongoTransactionManager(mongoDatabaseFactory);
    }

	@Bean
	ApplicationRunner createApplicationCollections(MongoTemplate mongoTemplate) {
		return args -> List.of(
				"admin_users",
				"admin_audit_log",
				"refresh_tokens",
				"contact_messages",
				"education",
				"experience",
				"media",
				"site_profile",
				"projects",
				"skills",
				"skill_categories"
		).forEach(collection -> {
			if (!mongoTemplate.collectionExists(collection)) {
				mongoTemplate.createCollection(collection);
			}
		});
	}
}