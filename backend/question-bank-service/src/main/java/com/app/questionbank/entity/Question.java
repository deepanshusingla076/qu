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
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;
    
    @Enumerated(EnumType.STRING)
    private QuestionType type;
    
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;
    
    private String category;
    
    @Column(nullable = false)
    private String correctAnswer;
    
    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")
    private List<String> options;
    
    @Column(columnDefinition = "TEXT")
    private String explanation;
    
    private Integer timeLimit; // in seconds
    
    @Column(nullable = false)
    private Integer marks = 1;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    @JsonIgnore
    private Quiz quiz;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
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
    @JsonProperty("points")
    public Integer getPoints() {
        return this.marks;
    }
    
    @JsonProperty("points")
    public void setPoints(Integer points) {
        this.marks = points;
    }
    
    public enum QuestionType {
        MULTIPLE_CHOICE, TRUE_FALSE, SINGLE_CHOICE
    }
    
    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
}