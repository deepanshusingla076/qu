package com.app.resultservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "question_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long questionId;
    
    @Column(nullable = false)
    private String userAnswer;
    
    @Column(nullable = false)
    private String correctAnswer;
    
    @Column(nullable = false)
    private Boolean isCorrect;
    
    private Integer timeTaken; // in seconds
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_result_id")
    private QuizResult quizResult;
}