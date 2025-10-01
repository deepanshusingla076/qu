package com.app.resultservice.repository;

import com.app.resultservice.entity.QuizResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    
    List<QuizResult> findByUserId(Long userId);
    
    List<QuizResult> findByQuizId(Long quizId);
    
    Optional<QuizResult> findByUserIdAndQuizId(Long userId, Long quizId);
    
    Page<QuizResult> findByUserId(Long userId, Pageable pageable);
    
    Page<QuizResult> findByQuizId(Long quizId, Pageable pageable);
    
    List<QuizResult> findByUserIdAndStatus(Long userId, QuizResult.ResultStatus status);
    
    @Query("SELECT AVG(qr.score) FROM QuizResult qr WHERE qr.quizId = :quizId")
    Double getAverageScoreByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT MAX(qr.score) FROM QuizResult qr WHERE qr.quizId = :quizId")
    Double getMaxScoreByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT MIN(qr.score) FROM QuizResult qr WHERE qr.quizId = :quizId")
    Double getMinScoreByQuizId(@Param("quizId") Long quizId);
    
    Long countByQuizId(Long quizId);
    
    Long countByUserIdAndStatus(Long userId, QuizResult.ResultStatus status);
    
    @Query("SELECT COUNT(qr) FROM QuizResult qr WHERE qr.quizId = :quizId AND qr.status = :status")
    Long countByQuizIdAndStatus(@Param("quizId") Long quizId, @Param("status") QuizResult.ResultStatus status);
    
    @Query("SELECT qr FROM QuizResult qr WHERE qr.createdAt BETWEEN :startDate AND :endDate")
    List<QuizResult> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT qr FROM QuizResult qr WHERE qr.userId = :userId ORDER BY qr.createdAt DESC")
    List<QuizResult> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT qr FROM QuizResult qr WHERE qr.quizId = :quizId ORDER BY qr.score DESC")
    List<QuizResult> findByQuizIdOrderByScoreDesc(@Param("quizId") Long quizId);
}