package com.app.questionbank.repository;

import com.app.questionbank.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    List<Quiz> findByIsActiveTrue();
    
    List<Quiz> findByCategory(String category);
    
    List<Quiz> findByCategoryAndIsActiveTrue(String category);
    
    List<Quiz> findByDifficulty(Quiz.Difficulty difficulty);
    
    List<Quiz> findByDifficultyAndIsActiveTrue(Quiz.Difficulty difficulty);
    
    List<Quiz> findByCreatedBy(Long createdBy);
    
    List<Quiz> findByCategoryContainingIgnoreCase(String category);
    
    List<Quiz> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
    
    @Query("SELECT q FROM Quiz q WHERE q.category = :category AND q.isActive = true")
    List<Quiz> findActiveQuizzesByCategory(@Param("category") String category);
    
    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.createdBy = :userId")
    Long countByCreatedBy(@Param("userId") Long userId);
}