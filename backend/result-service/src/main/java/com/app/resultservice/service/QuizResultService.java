package com.app.resultservice.service;

import com.app.resultservice.dto.QuizAttemptRequest;
import com.app.resultservice.dto.QuizResultResponse;
import com.app.resultservice.entity.QuestionResult;
import com.app.resultservice.entity.QuizResult;
import com.app.resultservice.repository.QuestionResultRepository;
import com.app.resultservice.repository.QuizResultRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QuizResultService {

    private final QuizResultRepository quizResultRepository;
    private final QuestionResultRepository questionResultRepository;
    private final QuestionBankClient questionBankClient;

    public QuizResultResponse submitQuizAttempt(QuizAttemptRequest request) {
        log.info("Processing quiz attempt for user {} on quiz {}", request.getUserId(), request.getQuizId());

        try {
            // Fetch quiz and questions from question bank service
            QuestionBankClient.QuizDto quiz = questionBankClient.getQuiz(request.getQuizId());
            List<QuestionBankClient.QuestionDto> questions = questionBankClient.getQuizQuestions(request.getQuizId());

            // Create quiz result
            QuizResult quizResult = new QuizResult();
            quizResult.setUserId(request.getUserId());
            quizResult.setQuizId(request.getQuizId());
            quizResult.setTotalQuestions(questions.size());
            quizResult.setTimeTaken(request.getTimeSpent().intValue());
            quizResult.setStartTime(LocalDateTime.now().minusSeconds(request.getTimeSpent()));
            quizResult.setEndTime(LocalDateTime.now());

            // Process answers and calculate score
            int correctAnswers = 0;
            int totalMarks = 0;
            int earnedMarks = 0;
            List<QuestionResult> questionResults = new ArrayList<>();

            Map<Long, QuestionBankClient.QuestionDto> questionMap = questions.stream()
                .collect(Collectors.toMap(QuestionBankClient.QuestionDto::id, q -> q));

            for (QuizAttemptRequest.UserAnswer userAnswer : request.getAnswers()) {
                QuestionBankClient.QuestionDto question = questionMap.get(userAnswer.getQuestionId());
                if (question != null) {
                    boolean isCorrect = question.correctAnswer().trim().equalsIgnoreCase(userAnswer.getAnswer().trim());
                    
                    QuestionResult questionResult = new QuestionResult();
                    questionResult.setQuestionId(userAnswer.getQuestionId());
                    questionResult.setUserAnswer(userAnswer.getAnswer());
                    questionResult.setCorrectAnswer(question.correctAnswer());
                    questionResult.setIsCorrect(isCorrect);
                    questionResult.setTimeTaken(userAnswer.getTimeSpent() != null ? userAnswer.getTimeSpent().intValue() : 0);
                    questionResult.setQuizResult(quizResult);

                    questionResults.add(questionResult);

                    if (isCorrect) {
                        correctAnswers++;
                        earnedMarks += question.marks() != null ? question.marks() : 1;
                    }
                    totalMarks += question.marks() != null ? question.marks() : 1;
                }
            }

            // Calculate final score
            double percentage = totalMarks > 0 ? (double) earnedMarks / totalMarks * 100 : 0;
            
            quizResult.setCorrectAnswers(correctAnswers);
            quizResult.setWrongAnswers(questions.size() - correctAnswers);
            quizResult.setScore(percentage);
            quizResult.setStatus(percentage >= 60 ? QuizResult.ResultStatus.PASSED : QuizResult.ResultStatus.FAILED);
            quizResult.setQuestionResults(questionResults);

            // Save to database
            QuizResult savedResult = quizResultRepository.save(quizResult);
            
            log.info("Quiz attempt processed successfully. Score: {}%, Status: {}", percentage, savedResult.getStatus());

            // Build response
            return buildQuizResultResponse(savedResult, quiz, questions);

        } catch (Exception e) {
            log.error("Error processing quiz attempt: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process quiz attempt: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public QuizResultResponse getQuizResult(Long resultId) {
        log.debug("Fetching quiz result with ID: {}", resultId);
        
        QuizResult quizResult = quizResultRepository.findById(resultId)
            .orElseThrow(() -> new RuntimeException("Quiz result not found with id: " + resultId));

        try {
            QuestionBankClient.QuizDto quiz = questionBankClient.getQuiz(quizResult.getQuizId());
            List<QuestionBankClient.QuestionDto> questions = questionBankClient.getQuizQuestions(quizResult.getQuizId());
            
            return buildQuizResultResponse(quizResult, quiz, questions);
        } catch (Exception e) {
            log.error("Error fetching quiz details: {}", e.getMessage());
            // Return basic result without quiz details
            return buildBasicQuizResultResponse(quizResult);
        }
    }

    @Transactional(readOnly = true)
    public Page<QuizResult> getUserQuizResults(Long userId, Pageable pageable) {
        log.debug("Fetching quiz results for user: {}", userId);
        return quizResultRepository.findByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<QuizResult> getQuizResults(Long quizId, Pageable pageable) {
        log.debug("Fetching results for quiz: {}", quizId);
        return quizResultRepository.findByQuizId(quizId, pageable);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getQuizStatistics(Long quizId) {
        log.debug("Generating statistics for quiz: {}", quizId);
        
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalAttempts", quizResultRepository.countByQuizId(quizId));
        stats.put("passedCount", quizResultRepository.countByQuizIdAndStatus(quizId, QuizResult.ResultStatus.PASSED));
        stats.put("failedCount", quizResultRepository.countByQuizIdAndStatus(quizId, QuizResult.ResultStatus.FAILED));
        stats.put("averageScore", quizResultRepository.getAverageScoreByQuizId(quizId));
        stats.put("highestScore", quizResultRepository.getMaxScoreByQuizId(quizId));
        stats.put("lowestScore", quizResultRepository.getMinScoreByQuizId(quizId));
        
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserStatistics(Long userId) {
        log.debug("Generating statistics for user: {}", userId);
        
        Map<String, Object> stats = new HashMap<>();
        
        List<QuizResult> userResults = quizResultRepository.findByUserId(userId);
        
        stats.put("totalQuizzesTaken", userResults.size());
        stats.put("quizzesPassed", userResults.stream().filter(r -> r.getStatus() == QuizResult.ResultStatus.PASSED).count());
        stats.put("quizzesFailed", userResults.stream().filter(r -> r.getStatus() == QuizResult.ResultStatus.FAILED).count());
        stats.put("averageScore", userResults.stream().mapToDouble(QuizResult::getScore).average().orElse(0.0));
        stats.put("bestScore", userResults.stream().mapToDouble(QuizResult::getScore).max().orElse(0.0));
        
        return stats;
    }

    private QuizResultResponse buildQuizResultResponse(QuizResult quizResult, QuestionBankClient.QuizDto quiz, List<QuestionBankClient.QuestionDto> questions) {
        Map<Long, QuestionBankClient.QuestionDto> questionMap = questions.stream()
            .collect(Collectors.toMap(QuestionBankClient.QuestionDto::id, q -> q));

        List<QuizResultResponse.QuestionResult> questionResults = quizResult.getQuestionResults().stream()
            .map(qr -> {
                QuestionBankClient.QuestionDto question = questionMap.get(qr.getQuestionId());
                return QuizResultResponse.QuestionResult.builder()
                    .questionId(qr.getQuestionId())
                    .questionText(question != null ? question.questionText() : "Question not found")
                    .userAnswer(qr.getUserAnswer())
                    .correctAnswer(qr.getCorrectAnswer())
                    .isCorrect(qr.getIsCorrect())
                    .points(qr.getIsCorrect() ? (question != null ? question.marks() : 1) : 0)
                    .maxPoints(question != null ? question.marks() : 1)
                    .explanation(question != null ? question.explanation() : null)
                    .options(question != null ? question.options() : null)
                    .build();
            })
            .collect(Collectors.toList());

        int totalMarks = questionResults.stream().mapToInt(QuizResultResponse.QuestionResult::getMaxPoints).sum();
        int earnedMarks = questionResults.stream().mapToInt(QuizResultResponse.QuestionResult::getPoints).sum();

        return QuizResultResponse.builder()
            .resultId(quizResult.getId())
            .quizId(quizResult.getQuizId())
            .quizTitle(quiz.title())
            .userId(quizResult.getUserId())
            .score(earnedMarks)
            .maxScore(totalMarks)
            .percentage(quizResult.getScore())
            .grade(calculateGrade(quizResult.getScore()))
            .timeSpent((long) quizResult.getTimeTaken())
            .submittedAt(quizResult.getEndTime())
            .questionResults(questionResults)
            .build();
    }

    private QuizResultResponse buildBasicQuizResultResponse(QuizResult quizResult) {
        return QuizResultResponse.builder()
            .resultId(quizResult.getId())
            .quizId(quizResult.getQuizId())
            .quizTitle("Quiz " + quizResult.getQuizId())
            .userId(quizResult.getUserId())
            .score(quizResult.getCorrectAnswers())
            .maxScore(quizResult.getTotalQuestions())
            .percentage(quizResult.getScore())
            .grade(calculateGrade(quizResult.getScore()))
            .timeSpent((long) quizResult.getTimeTaken())
            .submittedAt(quizResult.getEndTime())
            .questionResults(new ArrayList<>())
            .build();
    }

    private String calculateGrade(Double percentage) {
        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B";
        if (percentage >= 60) return "C";
        if (percentage >= 50) return "D";
        return "F";
    }
}