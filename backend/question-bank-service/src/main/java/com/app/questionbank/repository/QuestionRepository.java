package com.app.questionbank.repository;

import com.app.questionbank.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    List<Question> findByCategory(String category);
    
    List<Question> findByDifficulty(Question.Difficulty difficulty);
    
    List<Question> findByCategoryAndDifficulty(String category, Question.Difficulty difficulty);
    
    @Query("SELECT q FROM Question q WHERE q.category = :category ORDER BY RANDOM()")
    List<Question> findRandomQuestionsByCategory(@Param("category") String category, Pageable pageable);
    
    @Query("SELECT q FROM Question q WHERE q.difficulty = :difficulty ORDER BY RANDOM()")
    List<Question> findRandomQuestionsByDifficulty(@Param("difficulty") Question.Difficulty difficulty, Pageable pageable);
    
    @Query("SELECT q FROM Question q ORDER BY RANDOM()")
    List<Question> findRandomQuestions(Pageable pageable);
    
    @Query("SELECT DISTINCT q.category FROM Question q")
    List<String> findAllCategories();
    
    Long countByCategory(String category);
    
    Long countByDifficulty(Question.Difficulty difficulty);
    
    @Query("SELECT q FROM Question q WHERE q.quiz.id = :quizId")
    List<Question> findByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT COUNT(q) FROM Question q WHERE q.quiz.id = :quizId")
    int countByQuizId(@Param("quizId") Long quizId);
}