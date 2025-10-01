package com.app.questionbank.service;

import com.app.questionbank.dto.QuestionDTO;
import com.app.questionbank.dto.QuizRequestDTO;
import com.app.questionbank.dto.QuizResponseDTO;
import com.app.questionbank.entity.Question;
import com.app.questionbank.entity.Quiz;
import com.app.questionbank.repository.QuestionRepository;
import com.app.questionbank.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionService {
    
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    
    @Transactional
    public QuestionDTO createQuestion(QuestionDTO questionDTO) {
        Question question = mapToEntity(questionDTO);
        Question savedQuestion = questionRepository.save(question);
        return mapToDTO(savedQuestion);
    }
    
    @Transactional(readOnly = true)
    public List<QuestionDTO> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public QuestionDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        return mapToDTO(question);
    }
    
    @Transactional(readOnly = true)
    public List<Question> getQuestionsByQuizId(Long quizId) {
        // Verify quiz exists first
        if (!quizRepository.existsById(quizId)) {
            throw new RuntimeException("Quiz not found with id: " + quizId);
        }
        return questionRepository.findByQuizId(quizId);
    }
    
    @Transactional
    public Question addQuestionToQuiz(Long quizId, Question question) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + quizId));
        
        question.setQuiz(quiz);
        question.setCategory(quiz.getCategory());
        question.setDifficulty(Question.Difficulty.valueOf(quiz.getDifficulty().name()));
        
        return questionRepository.save(question);
    }
    
    @Transactional
    public QuestionDTO updateQuestion(Long questionId, QuestionDTO questionDTO) {
        Question existingQuestion = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));
        
        existingQuestion.setQuestionText(questionDTO.getQuestionText());
        existingQuestion.setType(questionDTO.getType());
        existingQuestion.setDifficulty(questionDTO.getDifficulty());
        existingQuestion.setCategory(questionDTO.getCategory());
        existingQuestion.setCorrectAnswer(questionDTO.getCorrectAnswer());
        existingQuestion.setOptions(questionDTO.getOptions());
        existingQuestion.setExplanation(questionDTO.getExplanation());
        existingQuestion.setTimeLimit(questionDTO.getTimeLimit());
        
        Question savedQuestion = questionRepository.save(existingQuestion);
        return mapToDTO(savedQuestion);
    }
    
    @Transactional
    public Question updateQuestion(Long questionId, Question question) {
        Question existingQuestion = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));
        
        existingQuestion.setQuestionText(question.getQuestionText());
        existingQuestion.setType(question.getType());
        existingQuestion.setDifficulty(question.getDifficulty());
        existingQuestion.setCategory(question.getCategory());
        existingQuestion.setCorrectAnswer(question.getCorrectAnswer());
        existingQuestion.setOptions(question.getOptions());
        existingQuestion.setExplanation(question.getExplanation());
        existingQuestion.setTimeLimit(question.getTimeLimit());
        if (question.getMarks() != null) {
            existingQuestion.setMarks(question.getMarks());
        }
        
        return questionRepository.save(existingQuestion);
    }
    
    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public List<QuestionDTO> getQuestionsByCategory(String category) {
        return questionRepository.findByCategory(category).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<QuestionDTO> getQuestionsByDifficulty(Question.Difficulty difficulty) {
        return questionRepository.findByDifficulty(difficulty).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public QuizResponseDTO generateQuiz(QuizRequestDTO request) {
        List<Question> questions;
        
        if (request.getCategory() != null && request.getDifficulty() != null) {
            questions = questionRepository.findByCategoryAndDifficulty(
                    request.getCategory(), request.getDifficulty());
        } else if (request.getCategory() != null) {
            questions = questionRepository.findRandomQuestionsByCategory(
                    request.getCategory(), 
                    PageRequest.of(0, request.getNumberOfQuestions()));
        } else if (request.getDifficulty() != null) {
            questions = questionRepository.findRandomQuestionsByDifficulty(
                    request.getDifficulty(), 
                    PageRequest.of(0, request.getNumberOfQuestions()));
        } else {
            questions = questionRepository.findRandomQuestions(
                    PageRequest.of(0, request.getNumberOfQuestions()));
        }
        
        // Limit to requested number of questions
        questions = questions.stream()
                .limit(request.getNumberOfQuestions())
                .collect(Collectors.toList());
        
        List<QuizResponseDTO.QuestionForQuizDTO> quizQuestions = questions.stream()
                .map(q -> new QuizResponseDTO.QuestionForQuizDTO(
                        q.getId(), q.getQuestionText(), q.getOptions(), q.getTimeLimit()))
                .collect(Collectors.toList());
        
        return new QuizResponseDTO(
                null, // We're not persisting the quiz, just generating it
                "Generated Quiz",
                "Dynamically generated quiz",
                request.getTimeLimit(),
                quizQuestions
        );
    }
    
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return questionRepository.findAllCategories();
    }
    
    private Question mapToEntity(QuestionDTO dto) {
        Question question = new Question();
        question.setQuestionText(dto.getQuestionText());
        question.setType(dto.getType());
        question.setDifficulty(dto.getDifficulty());
        question.setCategory(dto.getCategory());
        question.setCorrectAnswer(dto.getCorrectAnswer());
        question.setOptions(dto.getOptions());
        question.setExplanation(dto.getExplanation());
        question.setTimeLimit(dto.getTimeLimit());
        return question;
    }
    
    private QuestionDTO mapToDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setType(question.getType());
        dto.setDifficulty(question.getDifficulty());
        dto.setCategory(question.getCategory());
        dto.setCorrectAnswer(question.getCorrectAnswer());
        dto.setOptions(question.getOptions());
        dto.setExplanation(question.getExplanation());
        dto.setTimeLimit(question.getTimeLimit());
        return dto;
    }
}