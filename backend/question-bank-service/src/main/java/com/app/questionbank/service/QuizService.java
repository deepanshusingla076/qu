package com.app.questionbank.service;

import com.app.questionbank.dto.ManualQuizCreateDTO;
import com.app.questionbank.dto.QuestionCreateDTO;
import com.app.questionbank.entity.Question;
import com.app.questionbank.entity.Quiz;
import com.app.questionbank.repository.QuestionRepository;
import com.app.questionbank.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    public Quiz createQuiz(Quiz quiz) {
        log.info("Creating new quiz: {}", quiz.getTitle());
        quiz.setCreatedAt(LocalDateTime.now());
        return quizRepository.save(quiz);
    }

    public Quiz createManualQuiz(ManualQuizCreateDTO quizDTO) {
        log.info("Creating manual quiz with questions: {}", quizDTO.getTitle());
        
        // Create and save the quiz first
        Quiz quiz = new Quiz();
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setTimeLimit(quizDTO.getTimeLimit());
        quiz.setCategory(quizDTO.getCategory());
        quiz.setDifficulty(quizDTO.getDifficulty());
        quiz.setIsActive(quizDTO.getIsActive());
        quiz.setCreatedBy(quizDTO.getCreatedBy());
        quiz.setTotalQuestions(quizDTO.getQuestions() != null ? quizDTO.getQuestions().size() : 0);
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setUpdatedAt(LocalDateTime.now());
        
        Quiz savedQuiz = quizRepository.save(quiz);
        log.info("Quiz saved with ID: {}", savedQuiz.getId());
        
        // Create and save questions if provided
        if (quizDTO.getQuestions() != null && !quizDTO.getQuestions().isEmpty()) {
            List<Question> questions = new ArrayList<>();
            
            for (QuestionCreateDTO questionDTO : quizDTO.getQuestions()) {
                Question question = new Question();
                question.setQuestionText(questionDTO.getQuestionText());
                question.setType(questionDTO.getType());
                question.setOptions(questionDTO.getOptions());
                question.setCorrectAnswer(questionDTO.getCorrectAnswer());
                question.setExplanation(questionDTO.getExplanation());
                question.setMarks(questionDTO.getMarks());
                question.setDifficulty(questionDTO.getDifficulty() != null ? questionDTO.getDifficulty() : 
                    Question.Difficulty.valueOf(quizDTO.getDifficulty().name()));
                question.setCategory(questionDTO.getCategory() != null ? questionDTO.getCategory() : quizDTO.getCategory());
                question.setQuiz(savedQuiz);
                
                Question savedQuestion = questionRepository.save(question);
                questions.add(savedQuestion);
                log.debug("Question saved with ID: {}", savedQuestion.getId());
            }
            
            savedQuiz.setQuestions(questions);
            log.info("Created quiz with {} questions", questions.size());
        }
        
        return savedQuiz;
    }

    public Page<Quiz> getAllQuizzes(Pageable pageable) {
        log.debug("Fetching all quizzes with pagination");
        Page<Quiz> quizzes = quizRepository.findAll(pageable);
        
        // Load questions for each quiz and update totalQuestions
        quizzes.getContent().forEach(quiz -> {
            List<Question> questions = questionRepository.findByQuizId(quiz.getId());
            quiz.setQuestions(questions);
            quiz.setTotalQuestions(questions.size());
        });
        
        return quizzes;
    }

    public Quiz getQuizById(Long id) {
        log.debug("Fetching quiz by ID: {}", id);
        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + id));
        
        // Load questions explicitly
        List<Question> questions = questionRepository.findByQuizId(quiz.getId());
        quiz.setQuestions(questions);
        
        // Update totalQuestions
        quiz.setTotalQuestions(questions.size());
        
        return quiz;
    }

    public List<Quiz> getQuizzesByTopic(String topic) {
        log.debug("Fetching quizzes by topic: {}", topic);
        return quizRepository.findByCategoryContainingIgnoreCase(topic);
    }

    public List<Quiz> getQuizzesByDifficulty(String difficulty) {
        log.debug("Fetching quizzes by difficulty: {}", difficulty);
        try {
            Quiz.Difficulty diff = Quiz.Difficulty.valueOf(difficulty.toUpperCase());
            return quizRepository.findByDifficulty(diff);
        } catch (IllegalArgumentException e) {
            log.error("Invalid difficulty level: {}", difficulty);
            throw new RuntimeException("Invalid difficulty level: " + difficulty);
        }
    }

    public List<Quiz> getQuizzesByCreatedBy(Long userId) {
        log.debug("Fetching quizzes created by user ID: {}", userId);
        List<Quiz> quizzes = quizRepository.findByCreatedBy(userId);
        
        // Load questions for each quiz and update totalQuestions
        quizzes.forEach(quiz -> {
            try {
                List<Question> questions = questionRepository.findByQuizId(quiz.getId());
                quiz.setQuestions(questions);
                quiz.setTotalQuestions(questions.size());
            } catch (Exception e) {
                log.error("Error loading questions for quiz {}: {}", quiz.getId(), e.getMessage());
                quiz.setQuestions(new ArrayList<>());
                quiz.setTotalQuestions(0);
            }
        });
        
        return quizzes;
    }

    public Quiz updateQuiz(Long id, Quiz updatedQuiz) {
        log.info("Updating quiz with ID: {}", id);
        
        Quiz existingQuiz = getQuizById(id);
        
        existingQuiz.setTitle(updatedQuiz.getTitle());
        existingQuiz.setDescription(updatedQuiz.getDescription());
        existingQuiz.setCategory(updatedQuiz.getCategory());
        existingQuiz.setDifficulty(updatedQuiz.getDifficulty());
        existingQuiz.setTimeLimit(updatedQuiz.getTimeLimit());
        existingQuiz.setUpdatedAt(LocalDateTime.now());
        
        return quizRepository.save(existingQuiz);
    }

    public void deleteQuiz(Long id) {
        log.info("Deleting quiz with ID: {}", id);
        Quiz quiz = getQuizById(id);
        quizRepository.delete(quiz);
    }

    public List<Quiz> searchQuizzes(String keyword) {
        log.debug("Searching quizzes with keyword: {}", keyword);
        return quizRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }

    public Map<String, Object> getQuizStatistics(Long quizId) {
        log.debug("Getting statistics for quiz ID: {}", quizId);
        
        Quiz quiz = getQuizById(quizId);
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("quizId", quiz.getId());
        stats.put("title", quiz.getTitle());
        stats.put("questionCount", quiz.getQuestions() != null ? quiz.getQuestions().size() : 0);
        stats.put("createdAt", quiz.getCreatedAt());
        stats.put("difficulty", quiz.getDifficulty());
        stats.put("category", quiz.getCategory());
        stats.put("timeLimit", quiz.getTimeLimit());
        
        // Add more statistics as needed
        // stats.put("totalAttempts", resultRepository.countByQuizId(quizId));
        // stats.put("averageScore", resultRepository.getAverageScoreByQuizId(quizId));
        
        return stats;
    }

    public boolean existsById(Long quizId) {
        return quizRepository.existsById(quizId);
    }
}