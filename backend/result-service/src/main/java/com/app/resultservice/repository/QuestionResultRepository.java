package com.app.resultservice.repository;

import com.app.resultservice.entity.QuestionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionResultRepository extends JpaRepository<QuestionResult, Long> {
    
    List<QuestionResult> findByQuizResultId(Long quizResultId);
    
    List<QuestionResult> findByQuestionId(Long questionId);
    
    @Query("SELECT qr FROM QuestionResult qr WHERE qr.quizResult.userId = :userId")
    List<QuestionResult> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT qr FROM QuestionResult qr WHERE qr.questionId = :questionId AND qr.isCorrect = :isCorrect")
    List<QuestionResult> findByQuestionIdAndIsCorrect(@Param("questionId") Long questionId, @Param("isCorrect") Boolean isCorrect);
    
    @Query("SELECT COUNT(qr) FROM QuestionResult qr WHERE qr.questionId = :questionId AND qr.isCorrect = true")
    Long countCorrectAnswersByQuestionId(@Param("questionId") Long questionId);
    
    @Query("SELECT COUNT(qr) FROM QuestionResult qr WHERE qr.questionId = :questionId AND qr.isCorrect = false")
    Long countWrongAnswersByQuestionId(@Param("questionId") Long questionId);
    
    @Query("SELECT AVG(qr.timeTaken) FROM QuestionResult qr WHERE qr.questionId = :questionId")
    Double getAverageTimeByQuestionId(@Param("questionId") Long questionId);
}