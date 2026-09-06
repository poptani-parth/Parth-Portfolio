package com.parth.portfolio.portfolio.skill.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "skills")
public class Skill {
    @Id
    private String id;
    @Indexed
    private String name;

    /** Normalized value used for database-enforced case/whitespace uniqueness. */
    @Indexed(name = "uq_skills_name_normalized", unique = true, sparse = true)
    private String nameNormalized;
    @Indexed
    private String category;
    private Integer order;
    private String overview;
    private Double yearsOfExperience;
    private Integer knowledgePercentage;
    @Builder.Default
    private boolean active = true;
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
}
