package com.app.questionbank.dto;

import com.app.questionbank.entity.Quiz;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizDTO {
    private Long id;
    private String title;
    private String description;
    private Integer timeLimit;
    private Integer totalQuestions;
    private String category;
    private Quiz.Difficulty difficulty;
    private Boolean isActive;
    private Boolean active; // For frontend compatibility
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor from entity
    public QuizDTO(Quiz quiz) {
        this.id = quiz.getId();
        this.title = quiz.getTitle();
        this.description = quiz.getDescription();
        this.timeLimit = quiz.getTimeLimit();
        this.totalQuestions = quiz.getTotalQuestions();
        this.category = quiz.getCategory();
        this.difficulty = quiz.getDifficulty();
        this.isActive = quiz.getIsActive();
        this.active = quiz.getIsActive(); // For frontend compatibility
        this.createdBy = quiz.getCreatedBy();
        this.createdAt = quiz.getCreatedAt();
        this.updatedAt = quiz.getUpdatedAt();
    }
}