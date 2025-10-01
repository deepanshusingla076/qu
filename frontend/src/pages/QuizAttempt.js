import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';
import resultService from '../services/resultService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    fetchQuiz();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  useEffect(() => {
    if (quiz && timeRemaining !== null) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            if (!autoSubmitted) {
              setAutoSubmitted(true);
              handleSubmitQuiz(true); // Auto-submit when time runs out
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, timeRemaining, autoSubmitted]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      
      // Check if user has already attempted this quiz
      try {
        const userResultsResponse = await resultService.getResultsByUser(user.id);
        let userResults = [];
        if (Array.isArray(userResultsResponse)) {
          userResults = userResultsResponse;
        } else if (userResultsResponse && Array.isArray(userResultsResponse.content)) {
          userResults = userResultsResponse.content;
        }
        
        const hasAttempted = userResults.some(result => result.quizId && result.quizId.toString() === quizId.toString());
        
        if (hasAttempted) {
          toast.error('You have already attempted this quiz.');
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.warn('Could not check previous attempts:', error);
        // Continue with quiz attempt if we can't check
      }

      const quizData = await quizService.getQuizById(quizId);
      
      // Ensure questions array exists
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        console.error('Quiz questions not found or invalid:', quizData);
        toast.error('Quiz questions could not be loaded. Please contact the quiz creator.');
        navigate('/dashboard');
        return;
      }

      setQuiz(quizData);
      setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
      setQuizStartTime(new Date());
      
      // Initialize answers object
      const initialAnswers = {};
      quizData.questions.forEach((question, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
      
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz. Please try again.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    if (!isAutoSubmit && !showConfirmSubmit) {
      setShowConfirmSubmit(true);
      return;
    }

    try {
      setSubmitting(true);
      setShowConfirmSubmit(false);

      const endTime = new Date();
      const timeTaken = Math.round((endTime - quizStartTime) / 1000); // seconds

      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      const detailedAnswers = [];

      quiz.questions.forEach((question, index) => {
        const userAnswer = answers[index] || '';
        const isCorrect = question.correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
        
        if (isCorrect) {
          correctAnswers++;
          totalPoints += question.points || question.marks || 1;
        }

        detailedAnswers.push({
          questionId: question.id,
          questionText: question.questionText,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: isCorrect,
          points: isCorrect ? (question.points || question.marks || 1) : 0,
          explanation: question.explanation
        });
      });

      const maxPoints = quiz.questions.reduce((sum, q) => sum + (q.points || q.marks || 1), 0);
      const scorePercentage = Math.round((totalPoints / maxPoints) * 100);

      const result = {
        quizId: quiz.id,
        userId: user.id,
        quizTitle: quiz.title,
        score: scorePercentage,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        timeTaken,
        completedAt: endTime.toISOString(),
        answers: detailedAnswers,
        isAutoSubmitted: isAutoSubmit
      };

      const savedResult = await resultService.submitResult(result);
      
      if (isAutoSubmit) {
        toast.error('Time\'s up! Quiz submitted automatically.');
      } else {
        toast.success('Quiz submitted successfully!');
      }

      navigate(`/quiz/${quizId}/results/${savedResult.id}`);

    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 60) return 'critical'; // Less than 1 minute
    if (timeRemaining <= 300) return 'warning'; // Less than 5 minutes
    return 'normal';
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer.trim() !== '').length;
  };

  if (loading) {
    return <LoadingSpinner text="Loading quiz..." />;
  }

  if (!quiz) {
    return (
      <div className="quiz-error">
        <h2>Quiz not found</h2>
        <p>The quiz you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-attempt-page">
      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="quiz-info">
          <h1>{quiz.title}</h1>
          <div className="quiz-meta">
            <span>
              <i className="fas fa-questions"></i>
              {quiz.questions.length} questions
            </span>
            <span>
              <i className="fas fa-user"></i>
              {user.firstName} {user.lastName}
            </span>
          </div>
        </div>

        <div className="quiz-controls">
          <div className={`timer ${getTimeColor()}`}>
            <i className="fas fa-clock"></i>
            {formatTime(timeRemaining)}
          </div>
          <div className="progress-info">
            {getAnsweredCount()} / {quiz.questions.length} answered
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
      </div>

      <div className="quiz-content">
        {/* Question Navigation */}
        <div className="question-navigation">
          <div className="nav-title">Questions</div>
          <div className="nav-grid">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`nav-item ${
                  index === currentQuestionIndex ? 'active' : ''
                } ${
                  answers[index] && answers[index].trim() !== '' ? 'answered' : ''
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <div className="nav-legend">
            <div className="legend-item">
              <span className="legend-dot answered"></span>
              Answered
            </div>
            <div className="legend-item">
              <span className="legend-dot current"></span>
              Current
            </div>
            <div className="legend-item">
              <span className="legend-dot unanswered"></span>
              Unanswered
            </div>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="btn btn-primary btn-block submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="spinner small"></div>
                Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Submit Quiz
              </>
            )}
          </button>
        </div>

        {/* Question Content */}
        <div className="question-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="question-container"
            >
              <div className="question-header">
                <div className="question-number">
                  Question {currentQuestionIndex + 1}
                </div>
                <div className="question-type">
                  {currentQuestion.type.replace('_', ' ')}
                  {currentQuestion.points && (
                    <span className="points">({currentQuestion.points || currentQuestion.marks || 1} pts)</span>
                  )}
                </div>
              </div>

              <div className="question-text">
                {currentQuestion.questionText}
              </div>

              <div className="answer-section">
                {/* Multiple Choice */}
                {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                  <div className="multiple-choice-options">
                    {currentQuestion.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`option-label ${
                          answers[currentQuestionIndex] === option ? 'selected' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={option}
                          checked={answers[currentQuestionIndex] === option}
                          onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                        />
                        <span className="option-marker">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="option-text">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.type === 'TRUE_FALSE' && (
                  <div className="true-false-options">
                    <label
                      className={`option-label ${
                        answers[currentQuestionIndex] === 'True' ? 'selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value="True"
                        checked={answers[currentQuestionIndex] === 'True'}
                        onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                      />
                      <span className="option-marker">T</span>
                      <span className="option-text">True</span>
                    </label>
                    <label
                      className={`option-label ${
                        answers[currentQuestionIndex] === 'False' ? 'selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value="False"
                        checked={answers[currentQuestionIndex] === 'False'}
                        onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                      />
                      <span className="option-marker">F</span>
                      <span className="option-text">False</span>
                    </label>
                  </div>
                )}

                {/* Short Answer */}
                {currentQuestion.type === 'SHORT_ANSWER' && (
                  <div className="short-answer">
                    <textarea
                      value={answers[currentQuestionIndex] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                      className="form-textarea"
                      placeholder="Enter your answer here..."
                      rows="4"
                      maxLength="500"
                    />
                    <small>
                      {(answers[currentQuestionIndex] || '').length} / 500 characters
                    </small>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="question-navigation-buttons">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-arrow-left"></i>
                  Previous
                </button>

                <div className="question-counter">
                  {currentQuestionIndex + 1} / {quiz.questions.length}
                </div>

                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="btn btn-primary"
                  >
                    Next
                    <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="btn btn-success"
                  >
                    Submit Quiz
                    <i className="fas fa-paper-plane"></i>
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="modal-overlay">
          <div className="submit-confirmation-modal">
            <div className="modal-header">
              <h3>Submit Quiz?</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to submit your quiz?</p>
              <div className="submit-summary">
                <div className="summary-item">
                  <strong>Questions Answered:</strong> {getAnsweredCount()} / {quiz.questions.length}
                </div>
                <div className="summary-item">
                  <strong>Time Remaining:</strong> {formatTime(timeRemaining)}
                </div>
              </div>
              {getAnsweredCount() < quiz.questions.length && (
                <div className="warning-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  You have {quiz.questions.length - getAnsweredCount()} unanswered questions.
                  Unanswered questions will be marked as incorrect.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Continue Quiz
              </button>
              <button
                onClick={() => handleSubmitQuiz(false)}
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="spinner small"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttempt;
