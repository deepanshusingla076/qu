package com.app.questionbank.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    private String description;
    
    @Column(nullable = false)
    private Integer timeLimit; // in minutes
    
    @Column(nullable = false)
    private Integer totalQuestions;
    
    private String category;
    
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "quiz", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Question> questions;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Compatibility methods for frontend
    @JsonProperty("active")
    public Boolean getActive() {
        return this.isActive;
    }
    
    @JsonProperty("active")
    public void setActive(Boolean active) {
        this.isActive = active;
    }
    
    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
}