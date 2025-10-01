import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const QuizCard = ({ quiz, onDelete, showActions = false, showTakeQuiz = false, hasAttempted = false, attemptedResult = null }) => {
  const navigate = useNavigate();
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'primary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      className="quiz-card"
      whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="quiz-card-header">
        <div className="quiz-category">
          <i className="fas fa-tag"></i>
          {quiz.category || 'General'}
        </div>
        <div className={`difficulty-badge ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty || 'Medium'}
        </div>
      </div>

      <div className="quiz-card-body">
        <h3 className="quiz-title">{quiz.title}</h3>
        <p className="quiz-description">
          {quiz.description || 'Test your knowledge with this comprehensive quiz.'}
        </p>

        <div className="quiz-meta">
          <div className="meta-item">
            <i className="fas fa-question-circle"></i>
            <span>{quiz.totalQuestions || quiz.questionCount || quiz.questions?.length || 0} Questions</span>
          </div>
          <div className="meta-item">
            <i className="fas fa-clock"></i>
            <span>{quiz.timeLimit || 30} min</span>
          </div>
          <div className="meta-item">
            <i className="fas fa-calendar"></i>
            <span>{formatDate(quiz.createdAt)}</span>
          </div>
        </div>

        {quiz.totalAttempts !== undefined && (
          <div className="quiz-stats">
            <div className="stat">
              <span className="stat-label">Attempts:</span>
              <span className="stat-value">{quiz.totalAttempts}</span>
            </div>
            {quiz.averageScore && (
              <div className="stat">
                <span className="stat-label">Avg Score:</span>
                <span className="stat-value">{Math.round(quiz.averageScore)}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="quiz-card-footer">
        {showTakeQuiz && !hasAttempted && (
          <motion.button
            onClick={() => navigate(`/quiz/${quiz.id}/attempt`)}
            className="btn btn-primary btn-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-play"></i>
            Take Quiz
          </motion.button>
        )}

        {showTakeQuiz && hasAttempted && attemptedResult && (
          <div className="attempted-info">
            <div className="attempted-badge">
              <i className="fas fa-check-circle"></i>
              Completed
            </div>
            <div className="result-summary">
              Score: {attemptedResult.score}% ({attemptedResult.correctAnswers}/{attemptedResult.totalQuestions})
            </div>
            <motion.button
              onClick={() => navigate(`/quiz/${quiz.id}/results/${attemptedResult.id}`)}
              className="btn btn-info btn-small"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-eye"></i>
              View Results
            </motion.button>
          </div>
        )}

        {showTakeQuiz && hasAttempted && !attemptedResult && (
          <div className="attempted-info">
            <div className="attempted-badge completed">
              <i className="fas fa-check-circle"></i>
              Already Attempted
            </div>
            <p className="attempt-note">You have already taken this quiz.</p>
          </div>
        )}

        {showActions && (
          <div className="quiz-actions">
            <motion.button
              onClick={() => navigate(`/quiz/edit/${quiz.id}`)}
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-edit"></i>
              Edit
            </motion.button>
            
            <motion.button
              onClick={() => navigate(`/quiz/results/${quiz.id}`)}
              className="btn btn-info"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-chart-bar"></i>
              Results
            </motion.button>

            <motion.button
              onClick={() => onDelete && onDelete(quiz.id)}
              className="btn btn-danger"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-trash"></i>
              Delete
            </motion.button>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className={`status-indicator ${(quiz.active || quiz.isActive) ? 'active' : 'inactive'}`}>
        {(quiz.active || quiz.isActive) ? 'Active' : 'Inactive'}
      </div>
    </motion.div>
  );
};

export default QuizCard;