import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import resultService from '../services/resultService';
import quizService from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const QuizResults = () => {
  const { quizId, resultId } = useParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  const fetchResultData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch result and quiz data
      const [resultData, quizData] = await Promise.all([
        resultService.getResultById(resultId),
        quizService.getQuizById(quizId)
      ]);

      setResult(resultData);
      setQuiz(quizData);
      
    } catch (error) {
      console.error('Error fetching result data:', error);
      toast.error('Failed to load quiz results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [resultId, quizId, navigate]);

  useEffect(() => {
    fetchResultData();
  }, [fetchResultData]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very-good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 50) return 'poor';
    return 'very-poor';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent work! 🎉';
    if (score >= 80) return 'Great job! 👏';
    if (score >= 70) return 'Good work! 👍';
    if (score >= 60) return 'Not bad! Keep practicing! 📚';
    if (score >= 50) return 'You can do better! Keep trying! 💪';
    return 'Don\'t give up! Practice more! 🎯';
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return 'Outstanding';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Satisfactory';
    if (score >= 50) return 'Needs Improvement';
    return 'Requires Practice';
  };

  if (loading) {
    return <LoadingSpinner text="Loading your results..." />;
  }

  if (!result || !quiz) {
    return (
      <div className="results-error">
        <h2>Results not found</h2>
        <p>The quiz results you're looking for don't exist or have been removed.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="quiz-results-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Results Header */}
      <motion.div className="results-header" variants={itemVariants}>
        <div className="header-content">
          <h1>Quiz Results</h1>
          <p>{quiz.title}</p>
          <div className="completion-info">
            <span>
              <i className="fas fa-calendar"></i>
              Completed on {formatDate(result.completedAt)}
            </span>
            {result.isAutoSubmitted && (
              <span className="auto-submit-badge">
                <i className="fas fa-clock"></i>
                Auto-submitted
              </span>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(`/quiz/${quizId}`)}
            className="btn btn-primary"
          >
            <i className="fas fa-redo"></i>
            Retake Quiz
          </button>
        </div>
      </motion.div>

      {/* Score Overview */}
      <motion.div className="score-overview" variants={itemVariants}>
        <div className={`score-card ${getScoreColor(result.score)}`}>
          <div className="score-circle">
            <div className="score-number">{result.score}%</div>
            <div className="score-label">Your Score</div>
          </div>
          <div className="score-details">
            <h2>{getScoreMessage(result.score)}</h2>
            <p className="performance-level">{getPerformanceLevel(result.score)}</p>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div className="results-stats" variants={itemVariants}>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon correct">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{result.correctAnswers}</div>
              <div className="stat-label">Correct Answers</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon total">
              <i className="fas fa-list-ol"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{result.totalQuestions}</div>
              <div className="stat-label">Total Questions</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon time">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{formatTime(result.timeTaken)}</div>
              <div className="stat-label">Time Taken</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon accuracy">
              <i className="fas fa-target"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
              </div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Breakdown */}
      <motion.div className="performance-breakdown" variants={itemVariants}>
        <h2>Performance Breakdown</h2>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-header">
              <h3>Question Types</h3>
            </div>
            <div className="breakdown-content">
              {/* Group answers by question type */}
              {Object.entries(
                result.answers.reduce((acc, answer) => {
                  const question = quiz.questions.find(q => q.id === answer.questionId);
                  const type = question ? question.type.replace('_', ' ') : 'Unknown';
                  if (!acc[type]) {
                    acc[type] = { correct: 0, total: 0 };
                  }
                  acc[type].total++;
                  if (answer.isCorrect) acc[type].correct++;
                  return acc;
                }, {})
              ).map(([type, stats]) => (
                <div key={type} className="type-stat">
                  <div className="type-info">
                    <span className="type-name">{type}</span>
                    <span className="type-score">
                      {stats.correct}/{stats.total}
                    </span>
                  </div>
                  <div className="type-progress">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="type-percentage">
                    {Math.round((stats.correct / stats.total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-header">
              <h3>Time Analysis</h3>
            </div>
            <div className="breakdown-content">
              <div className="time-stat">
                <span className="time-label">Average per question</span>
                <span className="time-value">
                  {formatTime(Math.round(result.timeTaken / result.totalQuestions))}
                </span>
              </div>
              <div className="time-stat">
                <span className="time-label">Time limit</span>
                <span className="time-value">{quiz.timeLimit} minutes</span>
              </div>
              <div className="time-stat">
                <span className="time-label">Time remaining</span>
                <span className="time-value">
                  {formatTime(Math.max(0, (quiz.timeLimit * 60) - result.timeTaken))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Answer Review */}
      <motion.div className="answer-review" variants={itemVariants}>
        <div className="review-header">
          <h2>Review Answers</h2>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`btn ${showAnswers ? 'btn-secondary' : 'btn-primary'}`}
          >
            <i className={`fas fa-${showAnswers ? 'eye-slash' : 'eye'}`}></i>
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>
        </div>

        {showAnswers && (
          <motion.div 
            className="answers-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {result.answers.map((answer, index) => {
              const question = quiz.questions.find(q => q.id === answer.questionId);
              if (!question) return null;

              return (
                <div key={answer.questionId} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="answer-header">
                    <div className="question-info">
                      <span className="question-number">Q{index + 1}</span>
                      <span className={`result-indicator ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                        <i className={`fas fa-${answer.isCorrect ? 'check' : 'times'}`}></i>
                      </span>
                    </div>
                    <div className="question-points">
                      {answer.points} / {question.points || 1} pts
                    </div>
                  </div>

                  <div className="answer-content">
                    <div className="question-text">
                      {answer.questionText}
                    </div>

                    <div className="answer-details">
                      <div className="user-answer">
                        <strong>Your Answer:</strong>
                        <span className={answer.isCorrect ? 'correct' : 'incorrect'}>
                          {answer.userAnswer || 'No answer provided'}
                        </span>
                      </div>

                      {!answer.isCorrect && (
                        <div className="correct-answer">
                          <strong>Correct Answer:</strong>
                          <span className="correct">{answer.correctAnswer}</span>
                        </div>
                      )}

                      {answer.explanation && (
                        <div className="explanation">
                          <strong>Explanation:</strong>
                          <p>{answer.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div className="results-actions" variants={itemVariants}>
        <div className="actions-grid">
          <button
            onClick={() => navigate('/quiz/browse')}
            className="action-btn browse"
          >
            <i className="fas fa-search"></i>
            <span>Browse More Quizzes</span>
          </button>

          <button
            onClick={() => navigate('/results')}
            className="action-btn history"
          >
            <i className="fas fa-history"></i>
            <span>View All Results</span>
          </button>

          <button
            onClick={() => navigate(`/quiz/${quizId}`)}
            className="action-btn retake"
          >
            <i className="fas fa-redo"></i>
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Quiz Results: ${quiz.title}`,
                  text: `I scored ${result.score}% on "${quiz.title}"!`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }
            }}
            className="action-btn share"
          >
            <i className="fas fa-share"></i>
            <span>Share Results</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizResults;
