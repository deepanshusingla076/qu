package com.app.resultservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultResponse {
    
    private Long resultId;
    private Long quizId;
    private String quizTitle;
    private Long userId;
    private String username;
    private Integer score;
    private Integer maxScore;
    private Double percentage;
    private String grade;
    private Long timeSpent;
    private LocalDateTime submittedAt;
    private List<QuestionResult> questionResults;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResult {
        private Long questionId;
        private String questionText;
        private String userAnswer;
        private String correctAnswer;
        private Boolean isCorrect;
        private Integer points;
        private Integer maxPoints;
        private String explanation;
        private List<String> options;
    }
}