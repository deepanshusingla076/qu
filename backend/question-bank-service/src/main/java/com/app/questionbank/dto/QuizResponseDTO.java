package com.app.questionbank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponseDTO {
    
    private Long quizId;
    private String title;
    private String description;
    private Integer timeLimit;
    private List<QuestionForQuizDTO> questions;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionForQuizDTO {
        private Long id;
        private String questionText;
        private List<String> options;
        private Integer timeLimit;
    }
}