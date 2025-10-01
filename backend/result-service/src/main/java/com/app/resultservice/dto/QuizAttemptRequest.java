package com.app.resultservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptRequest {
    
    @NotNull(message = "Quiz ID is required")
    private Long quizId;
    
    private Long userId; // Set from JWT token
    
    @NotEmpty(message = "Answers are required")
    @Valid
    private List<UserAnswer> answers;
    
    private Long timeSpent; // in seconds
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAnswer {
        @NotNull(message = "Question ID is required")
        private Long questionId;
        
        @NotNull(message = "Answer is required")
        private String answer;
        
        private Long timeSpent; // time spent on this question in seconds
    }
}